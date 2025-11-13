<template>
  <div class="care-agenda">
    <div class="header-section">
      <div class="header-content">
        <div class="header-title">
          <q-icon name="event_note" size="32px" color="purple" class="q-mr-sm" />
          <h3 class="text-h5 text-weight-bold q-ma-none text-grey-9">Agenda de Cuidados</h3>
        </div>
        <div class="header-actions-buttons">
          <q-btn-toggle
            v-model="viewMode"
            toggle-color="purple"
            :options="[
              { label: 'Dia', value: 'day', icon: 'today' },
              { label: 'Semana', value: 'week', icon: 'view_week' },
              { label: 'Mês', value: 'month', icon: 'calendar_month' },
            ]"
            class="view-toggle"
            no-caps
          />
        </div>
      </div>
    </div>

    <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="error" />
      </template>
      {{ error }}
    </q-banner>

    <div v-if="loading" class="loading-state">
      <q-spinner color="purple" size="3em" />
      <div class="text-grey-7 q-mt-md">Carregando agenda...</div>
    </div>

    <div v-else class="calendar-container">
      <!-- Navegação do Calendário -->
      <div class="calendar-navigation">
        <q-btn
          flat
          round
          dense
          icon="chevron_left"
          color="purple"
          @click="previousPeriod"
          class="nav-btn"
        />
        <div class="period-label">{{ currentPeriodLabel }}</div>
        <q-btn
          flat
          round
          dense
          icon="chevron_right"
          color="purple"
          @click="nextPeriod"
          class="nav-btn"
        />
        <q-btn
          flat
          dense
          label="Hoje"
          color="purple"
          @click="goToToday"
          class="today-btn q-ml-md"
          no-caps
        />
      </div>

      <!-- Visualização de Dia -->
      <div v-if="viewMode === 'day'" class="day-view">
        <div v-if="dayEvents.length" class="events-list">
          <q-card v-for="item in dayEvents" :key="item.id" class="event-card">
            <q-card-section class="event-header">
              <div class="event-icon">
                {{ getCareIcon(item.care_type) }}
              </div>
              <div class="event-info">
                <div class="event-title">{{ item.care_type }}</div>
                <div class="event-time">{{ formatTime(item.care_date) }}</div>
              </div>
              <q-badge
                :color="getStatusColor(item.care_date)"
                :label="getStatusLabel(item.care_date)"
              />
            </q-card-section>
            <q-card-section v-if="item.notes" class="event-body">
              <div class="event-notes">
                <q-icon name="note" size="16px" color="purple" class="q-mr-xs" />
                <span>{{ item.notes }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div v-else class="empty-day">
          <q-icon name="event_available" size="64px" color="grey-4" />
          <div class="empty-text">Nenhum cuidado agendado para este dia</div>
        </div>
      </div>

      <!-- Visualização de Semana -->
      <div v-if="viewMode === 'week'" class="week-view">
        <div class="week-grid">
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="week-day"
            :class="{ today: isToday(day.date), selected: isSelected(day.date) }"
          >
            <div class="week-day-header">
              <div class="week-day-name">{{ day.name }}</div>
              <div class="week-day-number">{{ day.number }}</div>
            </div>
            <div class="week-day-events">
              <div
                v-for="event in day.events"
                :key="event.id"
                class="week-event"
                @click="selectDate(day.date)"
              >
                <div class="week-event-icon">{{ getCareIcon(event.care_type) }}</div>
                <div class="week-event-title">{{ event.care_type }}</div>
              </div>
              <div v-if="!day.events.length" class="week-no-events">
                <q-icon name="remove" size="xs" color="grey-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Visualização de Mês -->
      <div v-if="viewMode === 'month'" class="month-view">
        <div class="month-weekdays">
          <div
            v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
            :key="day"
            class="month-weekday"
          >
            {{ day }}
          </div>
        </div>
        <div class="month-grid">
          <div
            v-for="day in monthDays"
            :key="day.date"
            class="month-day"
            :class="{
              'other-month': !day.currentMonth,
              today: isToday(day.date),
              selected: isSelected(day.date),
              'has-events': day.events.length > 0,
            }"
            @click="selectDate(day.date)"
          >
            <div class="month-day-number">{{ day.number }}</div>
            <div v-if="day.events.length" class="month-day-dots">
              <div
                v-for="(event, idx) in day.events.slice(0, 3)"
                :key="idx"
                class="event-dot"
                :style="{ backgroundColor: getCareColor(event.care_type) }"
              />
              <div v-if="day.events.length > 3" class="more-events">
                +{{ day.events.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legenda -->
      <div class="legend">
        <div class="legend-title">Tipos de Cuidado:</div>
        <div class="legend-items">
          <div v-for="type in careTypesInUse" :key="type" class="legend-item">
            <div class="legend-dot" :style="{ backgroundColor: getCareColor(type) }"></div>
            <span>{{ type }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from 'boot/axios'

export default {
  name: 'CareAgenda',
  props: {
    pet_id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      careHistory: [],
      loading: false,
      error: '',
      viewMode: 'month',
      currentDate: new Date(),
      selectedDate: new Date(),
    }
  },
  computed: {
    currentPeriodLabel() {
      const options = { month: 'long', year: 'numeric' }
      if (this.viewMode === 'day') {
        return this.currentDate.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      }
      if (this.viewMode === 'week') {
        const startWeek = this.getWeekStart(this.currentDate)
        const endWeek = new Date(startWeek)
        endWeek.setDate(endWeek.getDate() + 6)
        return `${startWeek.getDate()} - ${endWeek.getDate()} de ${startWeek.toLocaleDateString('pt-BR', options)}`
      }
      return this.currentDate.toLocaleDateString('pt-BR', options)
    },
    dayEvents() {
      return this.getEventsForDate(this.currentDate)
    },
    weekDays() {
      const startWeek = this.getWeekStart(this.currentDate)
      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startWeek)
        date.setDate(date.getDate() + i)
        days.push({
          date: this.dateToString(date),
          name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          number: date.getDate(),
          events: this.getEventsForDate(date),
        })
      }
      return days
    },
    monthDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 42)

      for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.dateToString(d)
        days.push({
          date: dateStr,
          number: d.getDate(),
          currentMonth: d.getMonth() === month,
          events: this.getEventsForDate(d),
        })
      }
      return days
    },
    careTypesInUse() {
      const types = new Set()
      this.careHistory.forEach((item) => {
        if (item.status === 'active') types.add(item.care_type)
      })
      return Array.from(types)
    },
  },
  watch: {
    pet_id: {
      immediate: true,
      handler() {
        this.fetchCareHistory()
      },
    },
  },
  methods: {
    async fetchCareHistory() {
      if (!this.pet_id) return
      this.loading = true
      this.error = ''
      try {
        const response = await api.get('/pet-care-history', {
          params: { pet_id: this.pet_id },
        })

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.rows || response.data?.data || []
        this.careHistory = data.filter((item) => item.status === 'active')
      } catch (err) {
        console.error('Erro ao buscar histórico:', err)
        this.error = 'Não foi possível carregar a agenda.'
      } finally {
        this.loading = false
      }
    },
    getCareIcon(careType) {
      const icons = {
        Banho: '🛁',
        Tosa: '✂️',
        Vacina: '💉',
        Consulta: '🏥',
        Medicação: '💊',
        Exame: '🔬',
        Cirurgia: '⚕️',
        'Alimentação Especial': '🍖',
        Exercício: '🎾',
        Outro: '📝',
      }
      return icons[careType] || '📋'
    },
    getCareColor(careType) {
      const colors = {
        Banho: '#2196F3',
        Tosa: '#FF9800',
        Vacina: '#F44336',
        Consulta: '#4CAF50',
        Medicação: '#9C27B0',
        Exame: '#00BCD4',
        Cirurgia: '#E91E63',
        'Alimentação Especial': '#FF5722',
        Exercício: '#8BC34A',
        Outro: '#607D8B',
      }
      return colors[careType] || '#9E9E9E'
    },
    getEventsForDate(date) {
      const dateStr = this.dateToString(date)
      return this.careHistory.filter((item) => {
        const itemDate = this.dateToString(new Date(item.care_date))
        return itemDate === dateStr
      })
    },
    dateToString(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    isToday(dateStr) {
      return dateStr === this.dateToString(new Date())
    },
    isSelected(dateStr) {
      return dateStr === this.dateToString(this.selectedDate)
    },
    selectDate(dateStr) {
      const [year, month, day] = dateStr.split('-').map(Number)
      this.selectedDate = new Date(year, month - 1, day)
      this.currentDate = new Date(this.selectedDate)
      if (this.viewMode === 'month') {
        this.viewMode = 'day'
      }
    },
    getWeekStart(date) {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day
      return new Date(d.setDate(diff))
    },
    previousPeriod() {
      const d = new Date(this.currentDate)
      if (this.viewMode === 'day') {
        d.setDate(d.getDate() - 1)
      } else if (this.viewMode === 'week') {
        d.setDate(d.getDate() - 7)
      } else {
        d.setMonth(d.getMonth() - 1)
      }
      this.currentDate = d
    },
    nextPeriod() {
      const d = new Date(this.currentDate)
      if (this.viewMode === 'day') {
        d.setDate(d.getDate() + 1)
      } else if (this.viewMode === 'week') {
        d.setDate(d.getDate() + 7)
      } else {
        d.setMonth(d.getMonth() + 1)
      }
      this.currentDate = d
    },
    goToToday() {
      this.currentDate = new Date()
      this.selectedDate = new Date()
    },
    formatTime(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR')
    },
    getStatusColor(dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)

      if (date < today) return 'grey-5'
      if (date.getTime() === today.getTime()) return 'primary'
      return 'positive'
    },
    getStatusLabel(dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)

      if (date < today) return 'Concluído'
      if (date.getTime() === today.getTime()) return 'Hoje'
      return 'Agendado'
    },
  },
}
</script>

<style scoped>
.care-agenda {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  border-radius: 16px;
  overflow: hidden;
}

/* Header */
.header-section {
  background: white;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid #e8e8e8;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
}

.header-actions-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

/* Calendar Container */
.calendar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
}

/* Navigation */
.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.period-label {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 200px;
  text-align: center;
  text-transform: capitalize;
}

.nav-btn,
.today-btn {
  transition: all 0.2s ease;
}

.nav-btn:hover,
.today-btn:hover {
  transform: scale(1.1);
}

/* Day View */
.day-view {
  flex: 1;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border-left: 4px solid #9c27b0;
}

.event-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.event-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
}

.event-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.event-time {
  font-size: 14px;
  color: #7f8c8d;
}

.event-body {
  padding: 0 20px 20px 20px !important;
  background: #fafafa;
}

.event-notes {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #f8f4ff;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.6;
}

.empty-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-text {
  margin-top: 16px;
  font-size: 16px;
  color: #7f8c8d;
}

/* Week View */
.week-view {
  flex: 1;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.week-day {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.week-day.today {
  border: 2px solid #9c27b0;
  background: linear-gradient(135deg, #f8f4ff 0%, #ffffff 100%);
}

.week-day.selected {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(156, 39, 176, 0.2);
}

.week-day-header {
  text-align: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.week-day-name {
  font-size: 12px;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.week-day-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.week-day.today .week-day-number {
  color: #9c27b0;
}

.week-day-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-event {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f4ff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.week-event:hover {
  background: #f0e6ff;
  transform: translateX(4px);
}

.week-event-icon {
  font-size: 20px;
}

.week-event-title {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-no-events {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Month View */
.month-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.month-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.month-weekday {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #7f8c8d;
  padding: 8px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex: 1;
}

.month-day {
  background: white;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.month-day:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.month-day.other-month {
  opacity: 0.3;
}

.month-day.today {
  border: 2px solid #9c27b0;
  background: linear-gradient(135deg, #f8f4ff 0%, #ffffff 100%);
}

.month-day.selected {
  background: #f0e6ff;
}

.month-day.has-events {
  border-left: 3px solid #9c27b0;
}

.month-day-number {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.month-day.today .month-day-number {
  color: #9c27b0;
}

.month-day-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.more-events {
  font-size: 10px;
  color: #7f8c8d;
  font-weight: 600;
}

/* Legend */
.legend {
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #2c3e50;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-container {
    padding: 16px;
  }

  .week-grid {
    grid-template-columns: 1fr;
  }

  .month-grid {
    gap: 4px;
  }

  .month-day {
    min-height: 60px;
    padding: 6px;
  }

  .legend-items {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
