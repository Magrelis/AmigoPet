<template>
  <div class="register-page">
    <!-- Background decorativo -->
    <div class="background-decoration">
      <div class="gradient-circle circle-1"></div>
      <div class="gradient-circle circle-2"></div>
      <div class="gradient-circle circle-3"></div>
    </div>

    <div class="register-container">
      <q-card class="register-card">
        <!-- Header com logo -->
        <div class="card-header">
          <div class="logo-container">
            <q-img :src="logoText" class="logo-image" contain />
          </div>
          <div class="welcome-text">
            <h2 class="welcome-title">Crie sua conta</h2>
            <p class="welcome-subtitle">Comece a cuidar do seu pet com amor e tecnologia</p>
          </div>
        </div>

        <!-- Formulário -->
        <q-card-section class="form-section">
          <q-form @submit.prevent="register" class="register-form">
            <div class="input-group">
              <label class="input-label">
                <q-icon name="person" size="18px" class="q-mr-xs" />
                Nome completo
              </label>
              <q-input
                v-model="name"
                outlined
                required
                :disable="loading"
                placeholder="Digite seu nome"
                :rules="[(val) => !!val || 'Digite seu nome']"
                class="modern-input"
                hide-bottom-space
              />
              <div v-if="name && name.length < 3" class="error-hint">
                <q-icon name="info" size="14px" class="q-mr-xs" />
                O nome deve ter pelo menos 3 caracteres
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">
                <q-icon name="email" size="18px" class="q-mr-xs" />
                Email
              </label>
              <q-input
                v-model="email"
                type="email"
                outlined
                required
                :disable="loading"
                placeholder="seu@email.com"
                :rules="[(val) => !!val || 'Digite seu email']"
                class="modern-input"
                hide-bottom-space
              />
              <div v-if="email && !email.includes('@')" class="error-hint">
                <q-icon name="info" size="14px" class="q-mr-xs" />
                Email inválido
              </div>
            </div>

            <div class="password-row">
              <div class="input-group">
                <label class="input-label">
                  <q-icon name="lock" size="18px" class="q-mr-xs" />
                  Senha
                </label>
                <q-input
                  v-model="password"
                  :type="isPwd ? 'password' : 'text'"
                  outlined
                  required
                  :disable="loading"
                  placeholder="••••••••"
                  :rules="[(val) => !!val || 'Digite sua senha']"
                  class="modern-input"
                  hide-bottom-space
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer toggle-password"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
                <div v-if="password && password.length < 6" class="error-hint">
                  <q-icon name="info" size="14px" class="q-mr-xs" />
                  Mínimo 6 caracteres
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">
                  <q-icon name="lock" size="18px" class="q-mr-xs" />
                  Confirmar senha
                </label>
                <q-input
                  v-model="confirmPassword"
                  :type="isPwd ? 'password' : 'text'"
                  outlined
                  required
                  :disable="loading"
                  placeholder="••••••••"
                  :rules="[
                    (val) => !!val || 'Confirme sua senha',
                    (val) => val === password || 'As senhas não coincidem',
                  ]"
                  class="modern-input"
                  hide-bottom-space
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer toggle-password"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
                <div v-if="confirmPassword && confirmPassword !== password" class="error-hint">
                  <q-icon name="info" size="14px" class="q-mr-xs" />
                  As senhas não coincidem
                </div>
              </div>
            </div>

            <q-btn
              type="submit"
              label="Criar conta"
              class="submit-button"
              unelevated
              no-caps
              :loading="loading"
              :disable="!canSubmit || loading"
            >
              <template v-slot:loading>
                <q-spinner color="white" size="24px" />
              </template>
            </q-btn>

            <div class="divider">
              <span class="divider-text">ou</span>
            </div>

            <div class="login-section">
              <span class="login-text">Já tem uma conta?</span>
              <q-btn
                label="Fazer login"
                flat
                no-caps
                class="login-button"
                :disable="loading"
                @click="goToLogin"
              />
            </div>
          </q-form>
        </q-card-section>

        <!-- Footer -->
        <div class="card-footer">
          <div class="footer-icon">
            <q-icon name="pets" size="20px" />
          </div>
          <span>© 2025 AmigoPet - Cuidando com amor</span>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import logoText from 'src/assets/logo-text.png'

export default {
  name: 'RegisterPage',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      isPwd: true,
      loading: false,
      logoText,
    }
  },
  computed: {
    canSubmit() {
      return (
        this.name.length >= 3 &&
        this.email.length > 0 &&
        this.email.includes('@') &&
        this.password.length >= 6 &&
        this.confirmPassword.length >= 6 &&
        this.password === this.confirmPassword
      )
    },
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        Notify.create({
          type: 'negative',
          message: 'As senhas não coincidem',
          position: 'top',
        })
        return
      }
      this.loading = true
      try {
        await api.post('/users', {
          name: this.name,
          email: this.email,
          password: this.password,
        })
        Notify.create({
          type: 'positive',
          message: 'Cadastro realizado com sucesso!',
          position: 'top',
          timeout: 2000,
        })
        this.$router.push({ path: '/' })
      } catch (err) {
        Notify.create({
          type: 'negative',
          message: err.response?.data?.message || 'Falha no cadastro',
          position: 'top',
          actions: [{ icon: 'close', color: 'white' }],
        })
      } finally {
        this.loading = false
      }
    },
    goToLogin() {
      this.$router.push({ path: '/' })
    },
  },
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.register-page::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.02) 0%, transparent 50%);
  animation: subtleMove 20s ease-in-out infinite;
}

@keyframes subtleMove {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* Background Decoration */
.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: none;
}

.gradient-circle {
  display: none;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Register Container */
.register-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 680px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Header */
.card-header {
  background: white;
  padding: 40px 32px 32px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid #e8e8e8;
}

.logo-container {
  margin-bottom: 20px;
}

.logo-image {
  width: 280px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.welcome-text {
  color: #2c3e50;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.welcome-subtitle {
  font-size: 15px;
  margin: 0;
  opacity: 0.7;
  color: #7f8c8d;
}

/* Form Section */
.form-section {
  padding: 32px !important;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.password-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.modern-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  background: #f0f2f5;
}

.modern-input :deep(.q-field__control:focus-within) {
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modern-input :deep(.q-field__native) {
  font-size: 15px;
  color: #2c3e50;
  padding: 14px 16px;
}

.modern-input :deep(.q-field__native::placeholder) {
  color: #95a5a6;
}

.toggle-password {
  color: #7f8c8d;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #2c3e50;
}

.error-hint {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #e74c3c;
  margin-top: 4px;
}

/* Submit Button */
.submit-button {
  width: 100%;
  height: 54px;
  background: #6366f1;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: #4f46e5;
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
  transform: translateY(-2px);
}

.submit-button:active {
  transform: translateY(0);
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 8px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e8e8e8;
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 16px;
  background: white;
  color: #95a5a6;
  font-size: 13px;
  font-weight: 500;
}

/* Login Section */
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.login-text {
  font-size: 14px;
  color: #7f8c8d;
}

.login-button {
  color: #6366f1;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.login-button:hover {
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.1);
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  color: #7f8c8d;
  font-size: 13px;
  border-top: 1px solid #e8e8e8;
}

.footer-icon {
  color: #6366f1;
}

/* Responsive */
@media (max-width: 768px) {
  .register-page {
    padding: 16px;
  }

  .card-header {
    padding: 32px 24px 24px;
  }

  .logo-image {
    width: 220px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .form-section {
    padding: 24px !important;
  }

  .password-row {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
