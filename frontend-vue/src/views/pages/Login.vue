<template>
  <div class="c-app flex-row align-items-center login-page-bg">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol md="6" lg="5">
          <CCard class="p-4 login-card">
            <CCardBody class="p-0">
              <div class="text-center mb-4">
                <img src="@/assets/logo.svg" height="110px" alt="MFU Logo"/>
                <h3 class="mt-3 font-weight-bold card-title">Sign In</h3>
                <p class="text-muted">Sign in to your MFU Vision account</p>
              </div>

              <!-- Local Credentials Form -->
              <CForm @submit.prevent="onLocalSignIn" class="text-left mb-4">
                <div class="form-group mb-3">
                  <label class="font-weight-bold">Email:</label>
                  <input
                    type="email"
                    class="form-control custom-input"
                    placeholder="Enter email"
                    v-model="email"
                    required
                  />
                </div>
                <div class="form-group mb-4">
                  <label class="font-weight-bold">Password:</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control custom-input"
                      placeholder="Enter password"
                      v-model="password"
                      required
                    />
                    <span class="password-toggle-icon" @click="showPassword = !showPassword">
                      <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </span>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block custom-btn mb-3">
                  Sign In
                </button>
              </CForm>

              <div class="divider-text mb-4">
                <span>or sign in with</span>
              </div>

              <!-- Google Sign-In -->
              <div class="text-center mb-4">
                <img
                  class="google-btn"
                  @click="onAuthenGoogle"
                  src="@/assets/icons/logo-google.png"
                  width="48px"
                  alt="Google Sign-In"
                />
              </div>

              <!-- Sign Up Link -->
              <div class="text-center signup-link">
                <span>Don't have an account? </span>
                <router-link to="/pages/register" class="link-text">Sign Up</router-link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
    <TwoFA/>
    <CenterLoading/>
    <DialogMessage/>
  </div>
</template>

<script>
import TwoFA from '@/projects/components/dialog/TwoFA.vue'
import CenterLoading from '@/projects/components/dialog/CenterLoading.vue'
import DialogMessage from '@/projects/components/dialog/DialogMessage.vue'

export default {
  name: 'Login',
  components: {
    TwoFA,
    CenterLoading,
    DialogMessage
  },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false
    }
  },
  methods: {
    async onLocalSignIn() {
      if (!this.email || !this.password) {
        this.$store.commit("dialog/dialog", {
          title: "Input Error",
          message: "Please enter both email and password.",
          code: "AUTH_INPUT_MISSING",
          number: "1",
          status: true
        });
        return;
      }
      try {
        const body = {
          email: this.email,
          password: this.password
        };
        await this.$store.dispatch("auth/signIn", body)
      } catch (err) {
        // Managed by store
      }
    },
    async onAuthenGoogle() {
      try {
        const googleUser = await this.$gAuth.signIn();
        const id_token = googleUser.getAuthResponse().id_token;
        const body = {
          token: id_token,
          authType: "689c06d5255db4e56aea8902"
        };
        await this.$store.dispatch("auth/signIn", body)
      } catch (err) {
        this.$store.commit("dialog/dialog", {
          title: "Authentication Error",
          message: "Google Sign-In failed. Please try again.",
          code: "AUTH_GOOGLE_FAILED",
          number: "1",
          status: true
        })
      }
    }
  }
}
</script>

<style scoped>
.login-page-bg {
  background-color: #f4f5f7;
  min-height: 100vh;
}
.login-card {
  border: 1px solid #a31d1d;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.card-title {
  color: #1a1a1a;
}
.custom-input {
  border: 1px solid #c7c7c7;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.custom-input:focus {
  border-color: #a31d1d;
  box-shadow: 0 0 0 2px rgba(163, 29, 29, 0.1);
  outline: none;
}
.password-input-wrapper {
  position: relative;
}
.password-toggle-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
  display: flex;
  align-items: center;
}
.password-toggle-icon:hover {
  color: #343a40;
}
.custom-btn {
  background-color: #a31d1d;
  border-color: #a31d1d;
  color: white;
  border-radius: 6px;
  padding: 10px;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.custom-btn:hover {
  background-color: #821515;
  border-color: #821515;
}
.custom-btn:active {
  transform: scale(0.98);
}
.google-btn {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.google-btn:hover {
  transform: scale(1.08);
}
.divider-text {
  display: flex;
  align-items: center;
  text-align: center;
  color: #6c757d;
  font-size: 13px;
}
.divider-text::before,
.divider-text::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #dee2e6;
}
.divider-text:not(:empty)::before {
  margin-right: .5em;
}
.divider-text:not(:empty)::after {
  margin-left: .5em;
}
.signup-link {
  font-size: 14px;
}
.link-text {
  color: #a31d1d;
  font-weight: bold;
  text-decoration: none;
}
.link-text:hover {
  text-decoration: underline;
  color: #821515;
}
</style>
