<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="modern-header" elevated>
      <q-toolbar class="toolbar-content">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn"
        />
        <q-space />
        <div v-if="petStore.selectedPet" class="pet-info-chip">
          <q-avatar size="50px" class="pet-avatar">
            <q-icon :name="petStore.selectedPet.avatar" size="28px" color="white" />
          </q-avatar>
          <div class="pet-details">
            <div class="pet-name">{{ petStore.selectedPet.name }}</div>
            <div class="pet-subtitle">
              {{ petStore.selectedPet.breed }} • {{ petStore.selectedPet.age }} ano(s)
            </div>
          </div>
          <div
            class="status-badge"
            :class="
              petStore.selectedPet.status === 'healthy' ? 'status-healthy' : 'status-attention'
            "
          >
            <q-icon
              :name="petStore.selectedPet.status === 'healthy' ? 'check_circle' : 'warning'"
              size="15px"
            />
            <span>{{ petStore.selectedPet.status === 'healthy' ? 'Saudável' : 'Atenção' }}</span>
          </div>
        </div>
        <q-space />
        <NotificationMenu />
        <q-btn round flat class="user-btn q-ml-sm">
          <q-avatar size="42px" class="user-avatar">
            <span class="user-letter">{{ usernameFirstLetter }}</span>
          </q-avatar>

          <q-menu class="user-menu">
            <q-list class="menu-list">
              <q-item class="user-info-item">
                <q-item-section avatar>
                  <q-avatar size="48px" class="user-avatar">
                    <span class="user-letter">{{ usernameFirstLetter }}</span>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="user-name">{{ userStore.user?.name }}</q-item-label>
                  <q-item-label class="user-email">{{ userStore.user?.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="q-my-sm" />

              <q-item clickable v-ripple @click="logout" class="logout-item">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sair</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="300" class="modern-drawer">
      <q-scroll-area class="fit drawer-scroll">
        <q-list class="drawer-list">
          <div class="drawer-header">
            <q-icon name="pets" size="28px" color="white" />
            <span class="drawer-header-text">AmigoPet</span>
          </div>

          <div class="section-header">
            <q-icon name="dashboard" size="18px" class="q-mr-sm" />
            <span>MENU PRINCIPAL</span>
          </div>

          <q-item
            clickable
            v-ripple
            to="/home"
            exact
            class="drawer-item"
            active-class="active-item"
          >
            <q-item-section avatar>
              <div class="item-icon-wrapper">
                <q-icon name="home" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="item-label">Início</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/veterinarians" disable class="drawer-item disabled-item">
            <q-item-section avatar>
              <div class="item-icon-wrapper">
                <q-icon name="local_hospital" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="item-label">Veterinários</q-item-label>
              <q-item-label caption class="coming-soon">Em breve</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/social" disable class="drawer-item disabled-item">
            <q-item-section avatar>
              <div class="item-icon-wrapper">
                <q-icon name="people" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="item-label">Social</q-item-label>
              <q-item-label caption class="coming-soon">Em breve</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="section-separator" />

          <div class="section-header">
            <q-icon name="pets" size="18px" class="q-mr-sm" />
            <span>MEUS PETS</span>
          </div>

          <template v-if="loading === 'get_pets'">
            <q-item v-for="i in 3" :key="i" class="pet-skeleton">
              <q-item-section avatar>
                <q-skeleton type="QAvatar" size="48px" />
              </q-item-section>
              <q-item-section>
                <q-skeleton type="text" width="70%" />
                <q-skeleton type="text" width="40%" class="q-mt-xs" />
              </q-item-section>
              <q-item-section side>
                <q-skeleton type="QBadge" size="xs" />
              </q-item-section>
            </q-item>
          </template>

          <template v-else>
            <q-slide-item
              v-for="pet in petStore.pets"
              :key="pet.id"
              @right="(evt) => confirmDelete(pet, evt)"
              right-color="#ef4444"
              class="pet-slide-item"
            >
              <template v-slot:right>
                <div class="delete-action">
                  <q-icon name="delete" size="24px" />
                </div>
              </template>

              <q-item
                clickable
                v-ripple
                :active="petStore.selectedPet && petStore.selectedPet.id === pet.id"
                class="pet-item"
                :class="{
                  'pet-item-active': petStore.selectedPet && petStore.selectedPet.id === pet.id,
                }"
                @click="selectPet(pet)"
              >
                <q-item-section avatar>
                  <q-avatar size="48px" class="pet-item-avatar">
                    <q-icon :name="pet.avatar" size="28px" color="purple" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="pet-item-name">{{ pet.name }}</q-item-label>
                  <q-item-label class="pet-item-breed">{{ pet.breed }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="pet-item-actions">
                    <q-badge
                      :color="pet.status === 'healthy' ? 'green' : 'orange'"
                      rounded
                      class="status-dot"
                    />
                    <q-btn
                      round
                      flat
                      dense
                      icon="edit"
                      size="sm"
                      class="edit-btn"
                      @click.stop="openAddPetDialog(pet)"
                    >
                      <q-tooltip>Editar pet</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-slide-item>
          </template>

          <q-item clickable v-ripple @click="openAddPetDialog" class="add-pet-btn">
            <q-item-section avatar>
              <div class="add-pet-icon">
                <q-icon name="add" size="24px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="add-pet-label">Adicionar novo pet</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog
      v-model="addPetDialogOpen"
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="modern-pet-dialog">
        <div class="dialog-header">
          <div class="dialog-header-content">
            <div class="dialog-icon">
              <q-icon name="pets" size="28px" />
            </div>
            <div class="dialog-title">
              <div class="title-text">{{ newPet.id ? 'Editar Pet' : 'Adicionar Novo Pet' }}</div>
              <div class="title-subtitle">Gerencie as informações do seu pet</div>
            </div>
          </div>
          <q-btn icon="close" flat round dense class="close-btn" v-close-popup />
        </div>

        <q-card-section class="dialog-body">
          <q-form @submit="newPet.id ? updatePet(newPet.id) : savePet()">
            <div class="avatar-section">
              <q-avatar size="100px" class="pet-avatar-display">
                <q-icon
                  :name="petAvatars[newPet.species] || petAvatars.default"
                  size="60px"
                  color="purple"
                />
              </q-avatar>
            </div>

            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  <q-icon name="badge" size="18px" class="q-mr-xs" />
                  Nome do Pet
                </label>
                <q-input
                  v-model="newPet.name"
                  filled
                  :rules="[(val) => !!val || 'Nome é obrigatório']"
                  placeholder="Digite o nome"
                  class="modern-input"
                  hide-bottom-space
                />
              </div>

              <div class="form-section">
                <label class="form-label">
                  <q-icon name="pets" size="18px" class="q-mr-xs" />
                  Espécie
                </label>
                <q-select
                  v-model="newPet.species"
                  :options="speciesOptions"
                  filled
                  :rules="[(val) => !!val || 'Espécie é obrigatória']"
                  @update:model-value="updateAvatar"
                  placeholder="Selecione a espécie"
                  class="modern-input"
                  hide-bottom-space
                />
              </div>

              <div class="form-section">
                <label class="form-label">
                  <q-icon name="category" size="18px" class="q-mr-xs" />
                  Raça
                </label>
                <q-input
                  v-model="newPet.breed"
                  filled
                  :rules="[(val) => !!val || 'Raça é obrigatória']"
                  placeholder="Digite a raça"
                  class="modern-input"
                  hide-bottom-space
                />
              </div>

              <div class="form-section">
                <label class="form-label">
                  <q-icon name="cake" size="18px" class="q-mr-xs" />
                  Data de Nascimento
                </label>
                <q-input
                  v-model="newPet.birth_date"
                  filled
                  type="date"
                  :rules="[(val) => !!val || 'Data de nascimento é obrigatória']"
                  class="modern-input"
                  hide-bottom-space
                />
              </div>

              <div class="form-section">
                <label class="form-label">
                  <q-icon name="wc" size="18px" class="q-mr-xs" />
                  Sexo
                </label>
                <q-select
                  v-model="newPet.sex"
                  :options="sexOptions"
                  filled
                  :rules="[(val) => !!val || 'Sexo é obrigatório']"
                  placeholder="Selecione o sexo"
                  class="modern-input"
                  hide-bottom-space
                />
              </div>

              <div class="form-section">
                <label class="form-label">
                  <q-icon name="straighten" size="18px" class="q-mr-xs" />
                  Porte
                </label>
                <q-select
                  v-model="newPet.size"
                  :options="sizeOptions"
                  filled
                  :rules="[(val) => !!val || 'Porte é obrigatório']"
                  placeholder="Selecione o porte"
                  class="modern-input"
                  hide-bottom-space
                />
              </div>

              <div class="form-section full-width">
                <label class="form-label">
                  <q-icon name="favorite" size="18px" class="q-mr-xs" />
                  Status de Saúde
                </label>
                <q-select
                  v-model="newPet.status"
                  :options="statusOptions"
                  filled
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  class="modern-input"
                  hide-bottom-space
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon
                          :name="scope.opt.value === 'healthy' ? 'check_circle' : 'warning'"
                          :color="scope.opt.value === 'healthy' ? 'green' : 'orange'"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="dialog-actions">
              <q-btn label="Cancelar" flat class="action-btn" v-close-popup no-caps />
              <q-btn
                :label="newPet.id ? 'Atualizar' : 'Salvar'"
                type="submit"
                unelevated
                no-caps
                class="action-btn action-btn-primary"
                :loading="loading === 'save_pet'"
                :disable="loading === 'save_pet'"
              >
                <template v-slot:loading>
                  <q-spinner color="white" size="24px" />
                </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>
<script>
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import moment from 'moment'
import logoText from 'src/assets/logo-text.png'
import { mapStores } from 'pinia'
import { usePetStore } from 'src/stores/pet'
import { useUserStore } from 'src/stores/user'
import NotificationMenu from 'src/components/NotificationMenu.vue'

export default {
  name: 'MainLayout',
  components: {
    NotificationMenu,
  },
  async mounted() {
    await this.getPets()
  },
  data() {
    return {
      logoText,
      loading: null,
      addPetDialogOpen: false,
      leftDrawerOpen: false,
      newPet: {
        name: '',
        breed: '',
        species: '',
        birth_date: '',
        sex: '',
        size: '',
        avatar: '',
        status: 'healthy',
      },
      speciesOptions: ['Cachorro', 'Gato', 'Pássaro', 'Réptil', 'Outro'],
      sexOptions: ['Macho', 'Fêmea'],
      sizeOptions: ['Pequeno', 'Médio', 'Grande'],
      statusOptions: [
        { label: 'Saudável', value: 'healthy' },
        { label: 'Atenção', value: 'attention' },
      ],
      petAvatars: {
        Cachorro: 'fas fa-dog',
        Gato: 'fas fa-cat',
        Pássaro: 'fas fa-dove',
        Réptil: 'fas fa-dragon',
        default: 'fas fa-paw',
      },
    }
  },
  watch: {},
  computed: {
    ...mapStores(usePetStore, useUserStore),
    petInfoBarColor() {
      if (!this.petStore.selectedPet) return ''
      return this.petStore.selectedPet.status === 'healthy'
        ? 'bg-green-6'
        : this.petStore.selectedPet.status === 'attention'
          ? 'bg-amber-5'
          : ''
    },
    usernameFirstLetter() {
      return this.userStore.firstLetter
    },
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    selectPet(pet) {
      this.petStore.setSelectedPet(pet)
    },
    logout() {
      this.userStore.logout()
      this.petStore.clear()
      this.$router.push({ path: '/' })
    },
    openAddPetDialog(pet) {
      if (pet) {
        this.newPet = { ...pet }
        this.newPet.birth_date = moment(pet.birth_date).format('YYYY-MM-DD')
      } else {
        this.newPet = {
          name: '',
          breed: '',
          species: '',
          birth_date: '',
          sex: '',
          size: '',
          avatar: '',
          status: 'healthy',
        }
      }

      this.addPetDialogOpen = true
    },
    calculateAge(birthDate) {
      if (!birthDate) return 0

      moment.locale('pt-br')

      return moment().diff(moment(birthDate), 'years')
    },
    updateAvatar() {
      this.newPet.avatar = this.petAvatars[this.newPet.species] || this.petAvatars.default
    },
    confirmDelete(pet, slideEvt) {
      this.$q
        .dialog({
          title: 'Confirmar exclusão',
          message: `Deseja realmente excluir o pet "${pet.name}"?`,
          persistent: true,
          color: 'negative',
          ok: {
            label: 'Excluir',
            color: 'negative',
            flat: false,
            unelevated: true,
          },
          cancel: {
            label: 'Cancelar',
            color: 'grey-7',
            flat: true,
          },
        })
        .onOk(() => {
          this.deletePet(pet.id)
        })
        .onDismiss(() => {
          if (slideEvt && slideEvt.reset) slideEvt.reset()
        })
    },
    async getPets() {
      this.loading = 'get_pets'
      try {
        const { data } = await api.get('/pets')
        const pets = data.map((pet) => ({
          ...pet,
          age: this.calculateAge(pet.birth_date),
        }))
        this.petStore.setPets(pets)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = null
      }
    },
    async savePet() {
      this.loading = 'save_pet'
      try {
        await api.post('/pets', {
          ...this.newPet,
          avatar: this.newPet.avatar || this.petAvatars.default,
        })
        this.addPetDialogOpen = false
        await this.getPets()
      } catch (err) {
        console.error(err)
        Notify.create({
          type: 'negative',
          message: 'Falha ao cadastrar o pets',
          position: 'top',
          actions: [{ icon: 'close', color: 'white' }],
        })
      } finally {
        this.loading = null
      }
    },
    async updatePet(id) {
      this.loading = 'save_pet'
      try {
        await api.put(`/pets/${id}`, {
          ...this.newPet,
          avatar: this.newPet.avatar || this.petAvatars.default,
        })
        this.addPetDialogOpen = false
        if (this.petStore.selectedPet && this.petStore.selectedPet.id === id)
          this.petStore.setSelectedPet({ ...this.newPet, id })
        await this.getPets()
      } catch (err) {
        console.error(err)
        Notify.create({
          type: 'negative',
          message: 'Falha ao atualizar o pet',
          position: 'top',
          actions: [{ icon: 'close', color: 'white' }],
        })
      } finally {
        this.loading = null
      }
    },
    async deletePet(id) {
      this.loading = 'save_pet'
      try {
        await api.delete(`/pets/${id}`)
        this.addPetDialogOpen = false
        await this.getPets()
      } catch (err) {
        console.error(err)
        Notify.create({
          type: 'negative',
          message: 'Falha ao deletar o pet',
          position: 'top',
          actions: [{ icon: 'close', color: 'white' }],
        })
      } finally {
        this.loading = null
      }
    },
  },
}
</script>
<style lang="scss">
/* Modern Header Styles */
.modern-header {
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  box-shadow: 0 2px 12px rgba(156, 39, 176, 0.15);
}

.toolbar-content {
  padding: 0 24px;
  min-height: 80px;
}

.menu-btn {
  color: white;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.logo-container {
  margin-left: 16px;
}

.logo-img {
  height: 45px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.pet-info-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;
  margin: 10px 0;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  min-width: 360px;
}

.pet-info-chip:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.pet-avatar {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.pet-details {
  color: white;
  flex: 1;
}

.pet-name {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 3px;
}

.pet-subtitle {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 10px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.status-healthy {
  background: rgba(76, 175, 80, 0.2);
  color: #e8f5e9;
}

.status-healthy .q-icon {
  color: #a5d6a7;
}

.status-attention {
  background: rgba(255, 152, 0, 0.2);
  color: #fff8e1;
}

.status-attention .q-icon {
  color: #ffcc80;
}

.user-btn {
  color: white;
  transition: all 0.3s ease;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-letter {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.user-menu .menu-list {
  min-width: 280px;
  border-radius: 12px;
  overflow: hidden;
}

.user-info-item {
  padding: 16px;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
}

.user-info-item .user-avatar {
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  border: 2px solid white;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.user-email {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 2px;
}

.logout-item {
  padding: 12px 16px;
  transition: all 0.2s;
}

.logout-item:hover {
  background: #fff5f5;
}

/* Modern Pet Dialog Styles */
.modern-pet-dialog {
  width: 100%;
  max-width: 680px;
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

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.pet-avatar-display {
  background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
  box-shadow: 0 4px 16px rgba(156, 39, 176, 0.2);
  border: 3px solid white;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-section.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
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

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
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
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.25);
}

.action-btn-primary:hover {
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.35);
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .modern-pet-dialog {
    max-width: 100%;
    margin: 16px;
    border-radius: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .dialog-header {
    padding: 24px;
  }

  .dialog-body {
    padding: 24px !important;
  }

  .dialog-actions {
    flex-direction: column;
  }
}

/* Modern Drawer Styles */
.modern-drawer {
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  border-right: 1px solid #e8e8e8;
}

.drawer-scroll {
  padding: 16px;
}

.drawer-list {
  padding: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  border-radius: 12px;
  color: white;
}

.drawer-header-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px 8px;
  font-size: 12px;
  font-weight: 700;
  color: #7f8c8d;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.section-separator {
  margin: 16px 0;
  background: #e8e8e8;
}

.drawer-item {
  margin: 4px 0;
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 12px 16px;
}

.drawer-item:hover {
  background: rgba(156, 39, 176, 0.05);
  transform: translateX(4px);
}

.drawer-item.active-item {
  background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
  border-left: 4px solid #9c27b0;
}

.drawer-item.disabled-item {
  opacity: 0.5;
}

.item-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
  border-radius: 10px;
  color: #9c27b0;
}

.active-item .item-icon-wrapper {
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  color: white;
}

.item-label {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.coming-soon {
  font-size: 11px;
  color: #9c27b0;
  font-weight: 600;
  margin-top: 2px;
}

/* Pet Items Styles */
.pet-skeleton {
  margin: 4px 0;
  padding: 12px;
}

.pet-slide-item {
  margin: 4px 0;
}

.delete-action {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  height: 100%;
  padding: 0 16px;
}

.pet-item {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.pet-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.1);
}

.pet-item-active {
  background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
  border-color: #9c27b0;
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.15);
}

.pet-item-avatar {
  background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
  border: 2px solid white;
}

.pet-item-active .pet-item-avatar {
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  color: white;
}

.pet-item-active .pet-item-avatar .q-icon {
  color: white !important;
}

.pet-item-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.pet-item-breed {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 2px;
}

.pet-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  padding: 0;
}

.edit-btn {
  color: #7f8c8d;
  transition: all 0.2s;
}

.edit-btn:hover {
  color: #9c27b0;
  background: rgba(156, 39, 176, 0.1);
  transform: scale(1.1);
}

.add-pet-btn {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
  border-radius: 12px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
}

.add-pet-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
}

.add-pet-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.add-pet-label {
  font-size: 15px;
  font-weight: 600;
  color: white;
}
</style>
