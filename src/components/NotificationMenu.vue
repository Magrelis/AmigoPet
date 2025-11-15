<template>
  <div class="notification-wrapper">
    <q-btn round flat class="notification-btn">
      <q-icon name="notifications" size="24px" />
      <q-badge v-if="notifications.length > 0" color="red" floating rounded>
        {{ notifications.length }}
      </q-badge>

      <q-popup-proxy @show="loadRealNotifications">
        <q-card style="width: 400px;">
          <q-card-section class="bg-purple text-white">
            <div class="text-h6">Notificações de Cuidados</div>
          </q-card-section>

          <q-card-section style="max-height: 300px;" class="scroll">
            <!-- Loading -->
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner color="primary" size="2em" />
              <div class="q-mt-sm">Carregando notificações...</div>
            </div>

            <!-- Sem notificações -->
            <div v-else-if="notifications.length === 0" class="text-center q-pa-md text-grey">
              <q-icon name="notifications_off" size="3em" class="q-mb-sm" />
              <div>Nenhuma notificação encontrada</div>
              <div class="text-caption">Adicone cuidados aos seus pets para ver notificações aqui</div>
            </div>

            <!-- Lista de notificações -->
            <div v-else>
              <div
                v-for="(notification, index) in notifications"
                :key="notification.id || index"
                class="q-pa-sm q-mb-sm notification-item"
                @click="handleNotificationClick(notification)"
                style="cursor: pointer;"
              >
                <div class="text-weight-bold text-body1">
                  Notificação {{ index + 1 }}
                </div>
                <div class="text-body2">
                  {{ notification.message }}
                </div>
                <div class="text-caption text-grey">
                  Pet: {{ notification.petName }} • {{ formatDate(notification.careDate) }}
                </div>
                <div class="text-caption text-grey">
                  Tipo: {{ notification.careType }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions v-if="notifications.length > 0" align="right">
            <q-btn
              flat
              label="Limpar"
              color="grey"
              @click="clearNotifications"
              size="sm"
            />
          </q-card-actions>
        </q-card>
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script>
import { api } from 'boot/axios'
import { usePetStore } from 'src/stores/pet'

export default {
  name: 'NotificationMenu',
  data() {
    return {
      loading: false,
      notifications: []
    }
  },
  methods: {
    async loadRealNotifications() {
      this.loading = true
      console.log('🔄 Buscando notificações reais...')

      try {
        // Busca todos os pets do usuário
        const petsResponse = await api.get('/pets')
        const pets = petsResponse.data?.rows || petsResponse.data?.data || petsResponse.data || []
        console.log('📋 Pets encontrados:', pets)

        const allNotifications = []

        // Para cada pet, busca seus cuidados
        for (const pet of pets) {
          try {
            const careResponse = await api.get('/pet-care-history', {
              params: { pet_id: pet.id }
            })

            // Extrai os dados de cuidados independente do formato da resposta
            let careData = []
            if (Array.isArray(careResponse.data)) {
              careData = careResponse.data
            } else {
              careData = careResponse.data?.rows || careResponse.data?.data || []
            }

            console.log(`🐕 Cuidados do ${pet.name}:`, careData)

            // Processa cada cuidado ativo
            careData
              .filter(care => care.status === 'active') // Apenas cuidados ativos
              .forEach(care => {
                const message = this.createNotificationMessage(
                  pet.name,
                  care.care_type,
                  care.care_date
                )

                allNotifications.push({
                  id: care.id,
                  petId: pet.id,
                  petName: pet.name,
                  careType: care.care_type,
                  careDate: care.care_date,
                  message: message,
                  notes: care.notes,
                  careRating: care.care_rating
                })
              })

          } catch (error) {
            console.error(`❌ Erro ao buscar cuidados do pet ${pet.name}:`, error)
          }
        }

        // Ordena por data (mais recente primeiro) e limita a 20 notificações
        this.notifications = allNotifications
          .sort((a, b) => new Date(b.careDate) - new Date(a.careDate))
          .slice(0, 20)

        console.log('✅ Notificações carregadas:', this.notifications)

      } catch (error) {
        console.error('❌ Erro geral ao carregar notificações:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao carregar notificações',
          position: 'top',
          timeout: 3000
        })
      } finally {
        this.loading = false
      }
    },

    createNotificationMessage(petName, careType, careDate) {
      if (!careDate) {
        return `${petName} tem um ${careType || 'cuidado'} agendado`
      }

      const date = new Date(careDate)
      const today = new Date()

      // Remove a parte de hora para comparar apenas datas
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)

      const diffTime = date.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const careTypeText = (careType || 'cuidado').toLowerCase()

      if (diffDays === 0) {
        return `${petName} tem um ${careTypeText} para hoje`
      } else if (diffDays === 1) {
        return `${petName} tem um ${careTypeText} para amanhã`
      } else if (diffDays > 1 && diffDays <= 7) {
        return `${petName} tem um ${careTypeText} para esta semana`
      } else if (diffDays > 7) {
        return `${petName} tem um ${careTypeText} para daqui a ${diffDays} dias`
      } else if (diffDays === -1) {
        return `${petName} teve um ${careTypeText} ontem`
      } else if (diffDays < 0) {
        return `${petName} teve um ${careTypeText} há ${Math.abs(diffDays)} dias`
      }

      return `${petName} tem um ${careTypeText} agendado`
    },

    formatDate(dateString) {
      if (!dateString) return 'Data não definida'

      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Data inválida'

      return date.toLocaleDateString('pt-BR')
    },

    handleNotificationClick(notification) {
      console.log('📍 Clicou na notificação:', notification)

      const petStore = usePetStore()

      // Tenta encontrar o pet na store
      const pet = petStore.pets.find(p => p.id === notification.petId)

      if (pet) {
        // Seleciona o pet
        petStore.setSelectedPet(pet)

        this.$q.notify({
          message: `Agora mostrando cuidados de ${notification.petName}`,
          color: 'purple',
          position: 'top',
          timeout: 2000
        })

        // Fecha o popup
        this.$el.querySelector('.q-btn').click()
      } else {
        this.$q.notify({
          message: `Pet ${notification.petName} não encontrado`,
          color: 'warning',
          position: 'top',
          timeout: 2000
        })
      }
    },

    clearNotifications() {
      this.notifications = []
      this.$q.notify({
        message: 'Notificações limpas',
        color: 'positive',
        position: 'top',
        timeout: 2000
      })
    }
  },

  mounted() {
    console.log('🔔 Componente NotificationMenu carregado')
    // Carrega notificações iniciais
    this.loadRealNotifications()

    // Atualiza a cada 2 minutos
    setInterval(() => {
      this.loadRealNotifications()
    }, 120000)
  }
}
</script>

<style scoped>
.notification-wrapper {
  position: relative;
}

.notification-item {
  border-left: 4px solid #9c27b0;
  background: #f8f4ff;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background: #e8e2ff;
  transform: translateX(2px);
}
</style>
