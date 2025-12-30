import { z, ZodSchema, ZodError, ZodIssue } from "zod";

export class Validator {
  private data: any;
  private schema: ZodSchema<any>;
  private customMessages: Record<string, string>;
  private result: any = null;
  private errorResult: any = null;
  private hasRun: boolean = false;

  constructor(
    data: any,
    schema: ZodSchema<any> | Record<string, any>,
    messages: Record<string, string> = {}
  ) {
    this.data = data;
    this.customMessages = messages;

    // If it's a raw object, wrap it in z.object()
    if (schema instanceof ZodSchema) {
      this.schema = schema;
    } else {
      this.schema = z.object(schema as any);
    }
  }

  /**
   * Create a new Validator instance
   * @param data The input data to validate
   * @param schema Zod schema or object of Zod schemas / string-based rules
   * @param messages Optional custom error messages (style: 'field.rule' => 'message')
   */
  static make(
    data: any,
    schema: ZodSchema<any> | Record<string, any>,
    messages: Record<string, string> = {}
  ) {
    if (schema instanceof ZodSchema) {
      return new Validator(data, schema, messages);
    }

    const parsedSchema: Record<string, ZodSchema> = {};
    const sameRules: { field: string; target: string }[] = [];

    for (const [key, rule] of Object.entries(schema)) {
      if (rule instanceof ZodSchema) {
        parsedSchema[key] = rule;
      } else if (typeof rule === "string" || Array.isArray(rule)) {
        const ruleStr = Array.isArray(rule) ? rule.join("|") : rule;

        // Check for 'same:target'
        const parts = ruleStr.split("|");
        for (const part of parts) {
          const [name, args] = part.split(":");
          if (name === "same" && args) {
            sameRules.push({ field: key, target: args });
          }
        }

        parsedSchema[key] = Validator.parseStringRule(rule);
      } else {
        parsedSchema[key] = rule as ZodSchema;
      }
    }

    let objectSchema: ZodSchema = z.object(parsedSchema);

    if (sameRules.length > 0) {
      objectSchema = (objectSchema as any).superRefine((val: any, ctx: any) => {
        sameRules.forEach(({ field, target }) => {
          if (val[field] !== val[target]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The ${field} and ${target} must match.`,
              path: [field],
            });
          }
        });
      });
    }

    return new Validator(data, objectSchema, messages);
  }

  private static parseStringRule(rule: string | string[]): ZodSchema {
    const rules = Array.isArray(rule)
      ? rule
      : rule.split("|").map((r) => r.trim());

    let schema: any = z.string(); // Default base
    let isOptional = false;
    let isNullable = false;

    // 1. Determine Base Type
    const isFile =
      rules.includes("file") ||
      rules.includes("image") ||
      rules.includes("mimes");

    if (rules.includes("numeric") || rules.includes("integer")) {
      schema = z.coerce.number();
      if (rules.includes("integer")) schema = schema.int();
    } else if (rules.includes("boolean")) {
      schema = z.boolean();
    } else if (rules.includes("array")) {
      schema = z.array(z.any());
    } else if (rules.includes("date")) {
      schema = z.coerce.date();
    } else if (isFile) {
      schema = z.any().refine(
        (val) => {
          // Check if it looks like a Multer file object
          return (
            typeof val === "object" &&
            val !== null &&
            "fieldname" in val &&
            "originalname" in val &&
            "encoding" in val &&
            "mimetype" in val &&
            "size" in val
          );
        },
        { message: "The field must be a file." }
      );
    } else {
      schema = z.string();
    }

    // 2. Constraints & Modifiers
    for (const r of rules) {
      const [name, args] = r.split(":");
      const params = args ? args.split(",") : [];

      switch (name) {
        case "email":
          if (schema instanceof z.ZodString) schema = schema.email();
          break;
        case "url":
          if (schema instanceof z.ZodString) schema = schema.url();
          break;
        case "uuid":
          if (schema instanceof z.ZodString) schema = schema.uuid();
          break;
        case "min":
          if (!isNaN(Number(params[0]))) schema = schema.min(Number(params[0]));
          break;
        case "max":
          if (!isNaN(Number(params[0]))) {
            if (isFile) {
              schema = schema.refine(
                (val: any) => {
                  if (!val) return true; // Let nullable/optional handle nulls
                  // But wait, if we are in strict mode (not nullable), we should fail?
                  // No, max() usually doesn't enforce existence. required() does.
                  // But here val is the file object.
                  // If val is missing, and it's required, Base Type would have failed (if I revert Base Type).
                  // So here val is likely a file object.
                  return val.size <= Number(params[0]) * 1024;
                },
                {
                  message: `The file may not be greater than ${params[0]} kilobytes.`,
                }
              );
            } else {
              schema = schema.max(Number(params[0]));
            }
          }
          break;
        case "image":
          schema = schema.refine(
            (val: any) => {
              if (!val || typeof val !== "object" || !val.mimetype)
                return false;
              return val.mimetype.startsWith("image/");
            },
            { message: "The field must be an image." }
          );
          break;
        case "in":
          if (params.length > 0) {
            // For strings, we can use regex or refine
            schema = schema.refine((val: any) => params.includes(String(val)), {
              message: `The selected ${name} is invalid.`,
            });
          }
          break;
        case "not_in":
          if (params.length > 0) {
            schema = schema.refine(
              (val: any) => !params.includes(String(val)),
              {
                message: `The selected ${name} is invalid.`,
              }
            );
          }
          break;
        case "alpha":
          if (schema instanceof z.ZodString)
            schema = schema.regex(
              /^[a-zA-Z]+$/,
              "The field must only contain letters."
            );
          break;
        case "alpha_dash":
          if (schema instanceof z.ZodString)
            schema = schema.regex(
              /^[a-zA-Z0-9_-]+$/,
              "The field must only contain letters, numbers, dashes, and underscores."
            );
          break;
        case "alpha_num":
          if (schema instanceof z.ZodString)
            schema = schema.regex(
              /^[a-zA-Z0-9]+$/,
              "The field must only contain letters and numbers."
            );
          break;
        case "mimes":
          // For file validation
          schema = schema.refine(
            (val: any) => {
              if (!val || typeof val !== "object" || !val.mimetype)
                return false;
              // params are extensions (jpg, png). We need to map to mimetypes or check loosely.
              // Simplification: check if mimetype includes one of the params
              // Or better: map extensions to mimetypes? Too big.
              // Let's assume params are extensions, and we check if mimetype matches.
              // Actually, typically mimes:jpg,png means we check extension or mime.
              // For now, let's just check if mimetype contains the string (imperfect but simple)
              // OR check originalname extension.
              const extension = val.originalname
                ?.split(".")
                .pop()
                ?.toLowerCase();
              return params.includes(extension);
            },
            {
              message: `The file must be a file of type: ${params.join(", ")}.`,
            }
          );
          break;
        case "unique":
          // unique:table,column,ignore,idColumn
          // NOTE: Unique check requires Database implementation.
          // Since v3.0.0 (No-ORM), this rule is disabled by default.
          // You should implement your own uniqueness check manually in the controller.
          break;
      }
    }

    // 3. Modifiers
    const isRequired = rules.includes("required");
    isNullable = rules.includes("nullable");
    isOptional = rules.includes("sometimes") || !isRequired;

    if (isNullable) {
      schema = schema.nullable();
    }

    if (isOptional) {
      schema = schema.optional();
    }

    return schema;
  }

  /**
   * Check if validation fails
   */
  async fails(): Promise<boolean> {
    await this.run();
    return this.errorResult !== null;
  }

  /**
   * Check if validation passes
   */
  async passes(): Promise<boolean> {
    return !(await this.fails());
  }

  /**
   * Get the validation errors
   */
  errors() {
    // Should be called after fails()
    return this.errorResult || {};
  }

  /**
   * Get the validated data
   */
  async validated() {
    await this.run();
    if (this.errorResult) {
      throw new Error(
        "Validation failed. Check errors() before calling validated()."
      );
    }
    return this.result;
  }

  private async run() {
    if (this.hasRun) return;
    this.hasRun = true;

    // safeParseAsync to handle async refinements (like unique)
    const parseResult = await this.schema.safeParseAsync(this.data);

    if (parseResult.success) {
      this.result = parseResult.data;
      this.errorResult = null;
    } else {
      this.result = null;
      this.errorResult = this.formatErrors(parseResult.error);
    }
  }

  private formatErrors(error: ZodError) {
    // If we have custom messages, we try to apply them
    if (Object.keys(this.customMessages).length > 0) {
      error.issues = error.issues.map((issue) => {
        const message = this.getCustomMessage(issue);
        if (message) {
          return { ...issue, message };
        }
        return issue;
      });
    }

    const flattened = error.flatten();
    const errors: any = flattened.fieldErrors;

    // Add formErrors if any
    if (flattened.formErrors.length > 0) {
      errors.formErrors = flattened.formErrors;
    }

    return errors;
  }

  private getCustomMessage(issue: ZodIssue): string | undefined {
    const path = issue.path.join(".");
    let rule = "";

    // Map Zod issue codes to "Laravel-like" rules for key lookup
    switch (issue.code) {
      case "invalid_type":
        if (issue.received === "undefined" || issue.received === "null") {
          rule = "required";
        } else {
          // e.g. string, number, boolean
          rule = issue.expected;
        }
        break;
      case "invalid_string":
        if (typeof issue.validation === "string") {
          rule = issue.validation; // email, url, uuid, etc.
        } else {
          rule = "string";
        }
        break;
      case "too_small":
        rule = "min";
        break;
      case "too_big":
        rule = "max";
        break;
      case "custom":
        // Custom rules often have messages already, but we can override
        // For unique, mimes, etc.
        // We might need to inspect the message to guess the rule?
        // Or just use the path.
        rule = "custom";
        break;
      // Add more mappings as needed
      default:
        rule = issue.code;
    }

    // Try keys: "field.rule" -> "field"
    const specificKey = `${path}.${rule}`;
    if (this.customMessages[specificKey]) {
      return this.customMessages[specificKey];
    }

    // Fallback for generic field message "field"
    if (this.customMessages[path]) {
      return this.customMessages[path];
    }

    return undefined;
  }
}
