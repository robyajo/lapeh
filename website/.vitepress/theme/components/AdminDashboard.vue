<script setup>
import { ref, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
)

const activeTab = ref('web') // web, cli, crash
const isAuthenticated = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const authenticate = () => {
  if (username.value === 'roby' && password.value === 'Tiram@1993') {
    isAuthenticated.value = true
    localStorage.setItem('lapeh_admin_auth', 'true')
    fetchStats()
  } else {
    error.value = 'Invalid username or password'
  }
}

// Reactive Data Containers
const realCliData = ref(null)
const realOsData = ref(null)
const realCliVersionData = ref(null)
const crashReports = ref([])
const totalInstalls = ref(0)

const fetchStats = async () => {
  isLoading.value = true
  try {
    const res = await fetch('/api/stats')
    if (res.ok) {
        const data = await res.json()
        
        totalInstalls.value = data.totalInstalls || 0
        crashReports.value = data.recentCrashes || []

        // Update CLI Node Chart
        if (data.nodeStats && data.nodeStats.labels.length > 0) {
            realCliData.value = {
                labels: data.nodeStats.labels,
                datasets: [{
                    label: 'Node Version Usage',
                    backgroundColor: '#3b82f6',
                    data: data.nodeStats.data
                }]
            }
        }

        // Update OS Chart
        if (data.osStats && data.osStats.labels.length > 0) {
             const colors = ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#8e44ad', '#f1c40f', '#34495e'];
             realOsData.value = {
                labels: data.osStats.labels,
                datasets: [{
                    backgroundColor: colors.slice(0, data.osStats.labels.length),
                    data: data.osStats.data
                }]
            }
        }

        // Update CLI Version Chart
        if (data.cliStats && data.cliStats.labels.length > 0) {
             const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#1abc9c'];
             realCliVersionData.value = {
                labels: data.cliStats.labels,
                datasets: [{
                    label: 'Lapeh Version Usage',
                    backgroundColor: '#10b981',
                    data: data.cliStats.data
                }]
            }
        }
    }
  } catch (e) {
    console.error("Failed to fetch stats", e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (localStorage.getItem('lapeh_admin_auth') === 'true') {
    isAuthenticated.value = true
    fetchStats()
  }
})

// Mock Data (Fallback)
const webData = {
  labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  datasets: [
    {
      label: 'Pengunjung Harian',
      backgroundColor: '#f87171',
      borderColor: '#f87171',
      data: [40, 39, 10, 40, 39, 80, 40]
    }
  ]
}

const defaultOsData = {
  labels: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#8e44ad'],
      data: [40, 20, 10, 25, 5]
    }
  ]
}

const defaultCliData = {
  labels: ['Node 16', 'Node 18', 'Node 20', 'Node 22'],
  datasets: [
    {
      label: 'Node Version Usage',
      backgroundColor: '#3b82f6',
      data: [10, 30, 50, 10]
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>

<template>
  <div class="admin-dashboard">
    <div v-if="!isAuthenticated" class="auth-container">
      <h1>Lapeh Admin</h1>
      <p>Masukkan kredensial untuk melihat dashboard.</p>
      <input v-model="username" type="text" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" @keyup.enter="authenticate" />
      <button @click="authenticate">Masuk</button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-else>
      <div class="header">
        <h1>Dashboard Pemantauan <span v-if="isLoading" class="loading">(Loading...)</span></h1>
        <div class="tabs">
          <button :class="{ active: activeTab === 'web' }" @click="activeTab = 'web'">Web Analytics</button>
          <button :class="{ active: activeTab === 'cli' }" @click="activeTab = 'cli'">NPM & CLI</button>
          <button :class="{ active: activeTab === 'crash' }" @click="activeTab = 'crash'">Crash Reports</button>
        </div>
      </div>

      <div class="content">
        <!-- Web Analytics -->
        <div v-if="activeTab === 'web'" class="tab-content">
          <div class="card-grid">
            <div class="card">
              <h3>Pengunjung Mingguan</h3>
              <div class="chart-container">
                <Line :data="webData" :options="chartOptions" />
              </div>
            </div>
            <div class="card">
              <h3>Sistem Operasi Pengunjung</h3>
              <div class="chart-container">
                <Doughnut :data="defaultOsData" :options="chartOptions" />
              </div>
            </div>
          </div>
          <div class="card full-width">
             <h3>Halaman Populer</h3>
             <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                    <th>Avg. Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>/docs/getting-started</td><td>1,204</td><td>2m 30s</td></tr>
                  <tr><td>/docs/cli</td><td>850</td><td>1m 45s</td></tr>
                  <tr><td>/docs/architecture-guide</td><td>620</td><td>4m 10s</td></tr>
                </tbody>
             </table>
          </div>
        </div>

        <!-- CLI Analytics -->
        <div v-if="activeTab === 'cli'" class="tab-content">
          <div class="stats-row">
             <div class="stat-card">
               <h4>Total Installs</h4>
               <span class="number">{{ totalInstalls || '2,459' }}</span>
               <span class="trend up" v-if="totalInstalls > 0">Live Data</span>
             </div>
             <div class="stat-card">
               <h4>Active Projects</h4>
               <span class="number">142</span>
               <span class="trend up">+5%</span>
             </div>
             <div class="stat-card">
               <h4>CLI Version (Latest)</h4>
               <span class="number">v2.4.9</span>
             </div>
          </div>
          
          <div class="card-grid">
            <div class="card">
              <h3>Node.js Version Distribution</h3>
              <div class="chart-container">
                <Bar :data="realCliData || defaultCliData" :options="chartOptions" />
              </div>
            </div>
            <div class="card">
              <h3>OS Developer</h3>
              <div class="chart-container">
                 <!-- Reusing OS data structure for demo -->
                <Doughnut :data="realOsData || defaultOsData" :options="chartOptions" />
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 class="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Lapeh Version Usage</h3>
            <div class="h-64 flex items-center justify-center">
                 <Bar v-if="realCliVersionData" :data="realCliVersionData" :options="chartOptions" />
                 <div v-else class="text-zinc-400">Loading data...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Crash Reports -->
      <div v-if="activeTab === 'crash'" class="space-y-6">
           <div class="card full-width">
             <h3>Laporan Crash Terakhir</h3>
             <table class="crash-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Command</th>
                    <th>Error Message</th>
                    <th>OS</th>
                    <th>Node</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="crash in crashReports" :key="crash.id">
                    <td>{{ new Date(crash.timestamp).toLocaleString() }}</td>
                    <td><code>{{ crash.command }}</code></td>
                    <td class="error-msg">{{ crash.error }}</td>
                    <td>{{ crash.osPlatform }}</td>
                    <td>{{ crash.nodeVersion }}</td>
                  </tr>
                  <tr v-if="crashReports.length === 0">
                    <td colspan="5" style="text-align:center">Tidak ada laporan crash (atau menggunakan data mock).</td>
                  </tr>
                </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
}

.auth-container input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.auth-container button {
  padding: 0.5rem 1rem;
  background-color: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.header {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 1rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: var(--vp-c-text-2);
}

.tabs button.active {
  color: var(--vp-c-brand);
  border-bottom: 2px solid var(--vp-c-brand);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.card {
  background: var(--vp-c-bg-soft);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-container {
  height: 300px;
  position: relative;
}

.full-width {
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.stats-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--vp-c-bg-soft);
  padding: 1.5rem;
  border-radius: 8px;
  flex: 1;
  text-align: center;
}

.stat-card .number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: var(--vp-c-brand);
}

.error-msg {
  color: #ef4444;
  font-family: monospace;
}
</style>
