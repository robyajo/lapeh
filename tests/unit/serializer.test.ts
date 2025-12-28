import { getSerializer, createResponseSchema, createPaginatedResponseSchema } from '../../lib/core/serializer';

describe('Serializer', () => {
  it('should cache serializers', () => {
    const key = 'test-cache';
    const schema = { type: 'object', properties: { name: { type: 'string' } } };
    
    const serializer1 = getSerializer(key, schema);
    const serializer2 = getSerializer(key, schema);
    
    expect(serializer1).toBe(serializer2);
  });

  it('should serialize object correctly', () => {
    const key = 'user-simple';
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' }
      }
    };
    
    const stringify = getSerializer(key, schema);
    const result = stringify({ name: 'Roby', age: 25, ignored: 'value' });
    
    expect(JSON.parse(result)).toEqual({ name: 'Roby', age: 25 });
  });

  it('should create standard response schema', () => {
    const userSchema = { type: 'object', properties: { id: { type: 'integer' } } };
    const responseSchema = createResponseSchema(userSchema);
    
    expect(responseSchema).toHaveProperty('properties.status');
    expect(responseSchema).toHaveProperty('properties.message');
    expect(responseSchema).toHaveProperty('properties.data', userSchema);
  });

  it('should create paginated response schema', () => {
    const itemSchema = { type: 'string' };
    const paginatedSchema = createPaginatedResponseSchema(itemSchema);
    
    expect(paginatedSchema.properties.data.properties.data.type).toBe('array');
    expect(paginatedSchema.properties.data.properties.data.items).toEqual(itemSchema);
    expect(paginatedSchema.properties.data.properties.meta).toBeDefined();
  });
});
