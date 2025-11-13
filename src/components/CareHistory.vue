<template>
  <div class="care-history">
    <div class="header-section">
      <div class="header-content">
        <div class="header-title">
          <q-icon name="pets" size="32px" color="purple" class="q-mr-sm" />
          <h3 class="text-h5 text-weight-bold q-ma-none text-grey-9">Cuidados</h3>
        </div>
        <div class="header-actions-buttons">
          <q-btn
            :outline="showInactive"
            :unelevated="!showInactive"
            :color="showInactive ? 'grey-7' : 'grey-6'"
            :icon="showInactive ? 'visibility' : 'visibility_off'"
            size="md"
            @click="showInactive = !showInactive"
            class="toggle-btn"
          >
            <q-tooltip>{{ showInactive ? 'Ocultar inativos' : 'Mostrar inativos' }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            color="purple"
            icon="add"
            size="lg"
            class="add-btn"
            @click="showDialog = true"
          >
            <q-tooltip>Adicionar novo cuidado</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="error" />
      </template>
      {{ error }}
    </q-banner>
    <q-dialog
      v-model="showDialog"
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="modern-dialog">
        <div class="dialog-header">
          <div class="dialog-header-content">
            <div class="dialog-icon">
              <q-icon name="medical_services" size="28px" />
            </div>
            <div class="dialog-title">
              <div class="title-text">{{ isEditing ? 'Editar Cuidado' : 'Novo Cuidado' }}</div>
              <div class="title-subtitle">Registre os cuidados do seu pet</div>
            </div>
          </div>
          <q-btn icon="close" flat round dense class="close-btn" v-close-popup @click="resetForm" />
        </div>

        <q-card-section class="dialog-body">
          <q-form @submit.prevent="onSubmit">
            <div class="form-section">
              <label class="form-label">
                <q-icon name="medical_services" size="18px" class="q-mr-xs" />
                Tipo de cuidado
              </label>
              <q-select
                v-model="form.care_type"
                :options="careTypes"
                outlined
                emit-value
                map-options
                placeholder="Selecione o tipo"
                :rules="[(val) => !!val || 'Campo obrigatório']"
                class="modern-input"
              />
            </div>

            <div class="form-section">
              <label class="form-label">
                <q-icon name="event" size="18px" class="q-mr-xs" />
                Data do cuidado
              </label>
              <q-input
                v-model="form.care_date"
                outlined
                readonly
                placeholder="Selecione a data"
                :rules="[(val) => !!val || 'Campo obrigatório']"
                class="modern-input"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.care_date" mask="YYYY-MM-DD" today-btn color="purple">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="purple" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="form-section">
              <label class="form-label">
                <q-icon name="note" size="18px" class="q-mr-xs" />
                Observações
              </label>
              <q-input
                v-model="form.notes"
                type="textarea"
                outlined
                rows="4"
                placeholder="Adicione detalhes sobre o cuidado..."
                class="modern-input"
              />
            </div>

            <div class="form-section rating-section">
              <div class="rating-wrapper">
                <q-rating
                  v-model="form.care_rating"
                  size="2.8em"
                  color="amber"
                  icon="star_border"
                  icon-selected="star"
                  icon-half="star_half"
                  :max="5"
                />
                <q-btn
                  v-if="form.care_rating"
                  flat
                  dense
                  round
                  icon="close"
                  size="sm"
                  color="grey-6"
                  @click="form.care_rating = null"
                  class="clear-rating-btn"
                >
                  <q-tooltip>Limpar avaliação</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="dialog-actions">
              <q-btn
                label="Cancelar"
                flat
                color="grey-7"
                v-close-popup
                @click="resetForm"
                class="action-btn"
                no-caps
              />
              <q-btn
                type="submit"
                :label="isEditing ? 'Atualizar Cuidado' : 'Adicionar Cuidado'"
                unelevated
                color="purple"
                :loading="loading"
                class="action-btn action-btn-primary"
                no-caps
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <div v-if="loading && !careHistory.length" class="loading-state">
      <q-spinner color="purple" size="3em" />
      <div class="text-grey-7 q-mt-md">Carregando...</div>
    </div>

    <div v-else-if="orderedHistory.length" class="history-grid">
      <q-card
        v-for="item in orderedHistory"
        :key="item.id"
        class="history-card"
        @click="selectForEdit(item)"
      >
        <q-card-section class="card-header">
          <div class="care-icon-wrapper">
            <div class="care-icon" :class="{ inactive: item.status === 'inactive' }">
              {{ getCareIcon(item.care_type) }}
            </div>
          </div>
          <div class="care-info">
            <div class="care-type">
              {{ item.care_type }}
              <q-badge
                :color="item.status === 'active' ? 'positive' : 'grey-5'"
                :label="item.status === 'active' ? 'Ativo' : 'Inativo'"
                class="q-ml-xs status-badge"
              />
            </div>
            <div class="care-date">{{ formatDate(item.care_date) }}</div>
          </div>
          <div class="header-actions">
            <q-btn
              v-if="item.status === 'active'"
              flat
              round
              dense
              icon="archive"
              color="orange"
              size="sm"
              @click.stop="confirmInactivate(item.id)"
            >
              <q-tooltip>Inativar</q-tooltip>
            </q-btn>
            <q-btn
              v-else
              flat
              round
              dense
              icon="unarchive"
              color="positive"
              size="sm"
              @click.stop="confirmReactivate(item.id)"
            >
              <q-tooltip>Reativar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click.stop="confirmDelete(item.id)"
            >
              <q-tooltip>Excluir permanentemente</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section v-if="item.notes || item.care_rating" class="card-body">
          <div v-if="item.notes" class="notes-section">
            <div class="notes-content">
              <q-icon name="note" size="18px" color="purple" />
              <div class="notes-text">{{ item.notes }}</div>
            </div>
          </div>
          <div v-if="item.care_rating" class="rating-section">
            <q-rating
              :model-value="item.care_rating"
              size="18px"
              color="amber"
              icon="star"
              readonly
              :max="5"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <q-icon name="pets" size="80px" color="purple-3" />
      </div>
      <div class="empty-title">
        {{ showInactive ? 'Nenhum registro encontrado' : 'Nenhum cuidado registrado' }}
      </div>
      <div class="empty-subtitle">
        {{
          showInactive
            ? 'Não há registros inativos para exibir'
            : 'Clique no botão + para adicionar o primeiro cuidado'
        }}
      </div>
    </div>
  </div>
</template>
<script>
import { api } from 'boot/axios'

export default {
  name: 'CareHistory',
  emits: ['care-updated'],
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
      editingId: null,
      showDialog: false,
      showInactive: false,
      form: {
        care_date: this.todayStr(),
        care_type: '',
        notes: '',
        care_rating: null,
      },
      careTypes: [
        { label: '🛁 Banho', value: 'Banho' },
        { label: '✂️ Tosa', value: 'Tosa' },
        { label: '💉 Vacina', value: 'Vacina' },
        { label: '🏥 Consulta', value: 'Consulta' },
        { label: '💊 Medicação', value: 'Medicação' },
        { label: '🔬 Exame', value: 'Exame' },
        { label: '⚕️ Cirurgia', value: 'Cirurgia' },
        { label: '🍖 Alimentação Especial', value: 'Alimentação Especial' },
        { label: '🎾 Exercício', value: 'Exercício' },
        { label: '📝 Outro', value: 'Outro' },
      ],
    }
  },
  computed: {
    isEditing() {
      return this.editingId !== null
    },
    orderedHistory() {
      const filtered = this.showInactive
        ? this.careHistory
        : this.careHistory.filter((item) => item.status === 'active')
      return [...filtered].sort((a, b) => new Date(b.care_date) - new Date(a.care_date))
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
    todayStr() {
      const d = new Date()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${mm}-${dd}`
    },
    formatDate(value) {
      if (!value) return '-'
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return value
      return d.toLocaleDateString()
    },
    resetForm() {
      this.editingId = null
      this.showDialog = false
      this.form = {
        care_date: this.todayStr(),
        care_type: '',
        notes: '',
        care_rating: null,
      }
    },
    confirmDelete(id) {
      this.$q
        .dialog({
          title: 'Confirmar exclusão permanente',
          message: 'Esta ação não poderá ser desfeita. Deseja realmente excluir este registro?',
          cancel: {
            label: 'Cancelar',
            color: 'grey',
            flat: true,
          },
          ok: {
            label: 'Excluir',
            color: 'negative',
          },
          persistent: true,
        })
        .onOk(() => {
          this.deleteCareHistory(id)
        })
    },
    confirmInactivate(id) {
      this.$q
        .dialog({
          title: 'Confirmar inativação',
          message: 'Deseja inativar este registro?',
          cancel: {
            label: 'Cancelar',
            color: 'grey',
            flat: true,
          },
          ok: {
            label: 'Inativar',
            color: 'orange',
          },
          persistent: true,
        })
        .onOk(() => {
          this.inactivateCareHistory(id)
        })
    },
    confirmReactivate(id) {
      this.$q
        .dialog({
          title: 'Confirmar reativação',
          message: 'Deseja reativar este registro?',
          cancel: {
            label: 'Cancelar',
            color: 'grey',
            flat: true,
          },
          ok: {
            label: 'Reativar',
            color: 'positive',
          },
          persistent: true,
        })
        .onOk(() => {
          this.reactivateCareHistory(id)
        })
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
        this.careHistory = data
      } catch (err) {
        console.error('Erro ao buscar histórico:', err)
        this.error = 'Não foi possível carregar o histórico.'
      } finally {
        this.loading = false
      }
    },
    selectForEdit(item) {
      this.editingId = item.id
      this.showDialog = true

      const d = new Date(item.care_date)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dateStr = `${d.getFullYear()}-${mm}-${dd}`

      this.form = {
        care_date: dateStr,
        care_type: item.care_type || '',
        notes: item.notes || '',
        care_rating: item.care_rating ?? null,
      }
    },
    async onSubmit() {
      if (this.isEditing) {
        await this.updateCareHistory()
      } else {
        await this.createCareHistory()
      }
    },
    async createCareHistory() {
      this.loading = true
      this.error = ''
      try {
        const payload = {
          pet_id: this.pet_id,
          care_date: this.form.care_date,
          care_type: this.form.care_type,
          notes: this.form.notes || null,
          care_rating: this.form.care_rating ?? null,
        }
        await api.post('/pet-care-history', payload)
        await this.fetchCareHistory()
        this.resetForm()
        this.$emit('care-updated')
        this.$q.notify({
          type: 'positive',
          message: 'Cuidado adicionado com sucesso!',
          position: 'bottom',
        })
      } catch (err) {
        console.error('Erro ao criar registro:', err)
        this.error = 'Não foi possível adicionar o cuidado.'
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao adicionar cuidado',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },
    async updateCareHistory() {
      if (!this.editingId) return
      this.loading = true
      this.error = ''
      try {
        const payload = {
          pet_id: this.pet_id,
          care_date: this.form.care_date,
          care_type: this.form.care_type,
          notes: this.form.notes || null,
          care_rating: this.form.care_rating ?? null,
        }
        await api.put(`/pet-care-history/${this.editingId}`, payload)
        await this.fetchCareHistory()
        this.resetForm()
        this.$emit('care-updated')
        this.$q.notify({
          type: 'positive',
          message: 'Cuidado atualizado com sucesso!',
          position: 'bottom',
        })
      } catch (err) {
        console.error('Erro ao atualizar registro:', err)
        this.error = 'Não foi possível atualizar o cuidado.'
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao atualizar cuidado',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },
    async deleteCareHistory(id) {
      this.loading = true
      this.error = ''
      try {
        await api.delete(`/pet-care-history/${id}`)
        await this.fetchCareHistory()
        this.$emit('care-updated')
        this.$q.notify({
          type: 'positive',
          message: 'Registro excluído com sucesso!',
          position: 'bottom',
        })
      } catch (err) {
        console.error('Erro ao excluir registro:', err)
        this.error = 'Não foi possível excluir o cuidado.'
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao excluir registro',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },
    async inactivateCareHistory(id) {
      this.loading = true
      this.error = ''
      try {
        console.log(id)
        await api.put(`/pet-care-history/${id}`, { status: 'inactive' })
        await this.fetchCareHistory()
        this.$emit('care-updated')
        this.$q.notify({
          type: 'positive',
          message: 'Registro inativado com sucesso!',
          position: 'bottom',
        })
      } catch (err) {
        console.error('Erro ao inativar registro:', err)
        this.error = 'Não foi possível inativar o cuidado.'
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao inativar registro',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },
    async reactivateCareHistory(id) {
      this.loading = true
      this.error = ''
      try {
        await api.put(`/pet-care-history/${id}`, { status: 'active' })
        await this.fetchCareHistory()
        this.$emit('care-updated')
        this.$q.notify({
          type: 'positive',
          message: 'Registro reativado com sucesso!',
          position: 'bottom',
        })
      } catch (err) {
        console.error('Erro ao reativar registro:', err)
        this.error = 'Não foi possível reativar o cuidado.'
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao reativar registro',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style scoped>
.care-history {
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

.toggle-btn {
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  transform: translateY(-2px);
}

.add-btn {
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%) !important;
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(156, 39, 176, 0.4);
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

/* History Grid */
.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 24px;
  overflow-y: auto;
}

.history-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.history-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #9c27b0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px !important;
  border-bottom: 1px solid #f0f0f0;
}

.care-icon-wrapper {
  flex-shrink: 0;
}

.care-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: white;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
}

.care-icon.inactive {
  opacity: 0.5;
  filter: grayscale(1);
}

.care-info {
  flex: 1;
  min-width: 0;
}

.care-type {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.care-date {
  font-size: 13px;
  color: #7f8c8d;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.status-badge {
  flex-shrink: 0;
}

.card-body {
  padding: 16px !important;
  background: white;
}

.notes-section {
  margin-bottom: 12px;
}

.notes-content {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f4ff;
  border-left: 3px solid #9c27b0;
  border-radius: 8px;
}

.notes-text {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.6;
}

.rating-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .history-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .header-section {
    padding: 16px;
  }
}

/* Modern Dialog Styles */
.modern-dialog {
  width: 100%;
  max-width: 560px;
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dialog-header {
  background: white;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.dialog-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.2);
}

.dialog-title {
  color: #2c3e50;
}

.title-text {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2px;
  color: #2c3e50;
}

.title-subtitle {
  font-size: 13px;
  color: #7f8c8d;
  font-weight: 400;
}

.close-btn {
  color: #7f8c8d;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #2c3e50;
  background: #f5f5f5;
}

.dialog-body {
  padding: 24px !important;
  background: #fafafa;
}

.form-section {
  margin-bottom: 16px;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
}

.modern-input :deep(.q-field__control) {
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.modern-input :deep(.q-field__control:focus-within) {
  box-shadow: 0 4px 16px rgba(156, 39, 176, 0.15);
}

.modern-input :deep(.q-field__native),
.modern-input :deep(.q-field__input) {
  font-size: 15px;
  color: #2c3e50;
}

.modern-input :deep(textarea) {
  resize: none;
}

.rating-section {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.clear-rating-btn {
  margin-left: 8px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn-primary {
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.25);
}

.action-btn-primary:hover {
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.35);
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .modern-dialog {
    max-width: 100%;
    margin: 16px;
    border-radius: 20px;
  }

  .dialog-header {
    padding: 24px;
  }

  .dialog-icon {
    width: 48px;
    height: 48px;
  }

  .title-text {
    font-size: 20px;
  }

  .dialog-body {
    padding: 24px !important;
  }

  .dialog-actions {
    flex-direction: column;
  }
}
</style>
