<template>
  <div class="c-app flex-row align-items-center register-page-bg">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol md="6" lg="5">
          <CCard class="p-4 register-card">
            <CCardBody class="p-0">
              <div class="text-center mb-4">
                <h1 class="font-weight-bold register-title">Sign Up</h1>
              </div>

              <CForm @submit.prevent="onSignUp" class="text-left">
                <!-- Username -->
                <div class="form-group mb-3">
                  <label class="font-weight-bold input-label">Username:</label>
                  <input
                    type="text"
                    class="form-control custom-input"
                    placeholder="Enter your name"
                    v-model="username"
                    required
                  />
                </div>

                <!-- Email -->
                <div class="form-group mb-3">
                  <label class="font-weight-bold input-label">Email:</label>
                  <input
                    type="email"
                    class="form-control custom-input"
                    placeholder="Enter email"
                    v-model="email"
                    required
                  />
                </div>

                <!-- Password -->
                <div class="form-group mb-3">
                  <label class="font-weight-bold input-label">Password:</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control custom-input"
                      placeholder="Enter your password"
                      v-model="password"
                      required
                    />
                    <span class="password-toggle-icon" @click="showPassword = !showPassword">
                      <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </span>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div class="form-group mb-3">
                  <label class="font-weight-bold input-label">Confirm-Password:</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control custom-input"
                      placeholder="Enter your confirm-password"
                      v-model="confirmPassword"
                      required
                    />
                    <span class="password-toggle-icon" @click="showConfirmPassword = !showConfirmPassword">
                      <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </span>
                  </div>
                </div>

                <!-- Role -->
                <div class="form-group mb-3">
                  <label class="font-weight-bold input-label">Role:</label>
                  <select class="form-control custom-input" v-model="role">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <!-- Licence Plate (only for users) -->
                <div class="form-group mb-4" v-if="role === 'user'">
                  <label class="font-weight-bold input-label">Your licence plate letter:</label>
                  <input
                    type="text"
                    class="form-control custom-input"
                    placeholder="Ex. กก 4343 เชียงใหม่"
                    v-model="licensePlate"
                    :required="role === 'user'"
                  />
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary btn-block custom-btn mb-3">
                  Sign Up
                </button>
              </CForm>

              <!-- Back to Sign In Link -->
              <div class="text-center signin-link">
                <span>Already have an account? </span>
                <router-link to="/pages/login" class="link-text">Sign In</router-link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
    <DialogMessage/>
    <CenterLoading/>
  </div>
</template>

<script>
import Service from "@/service/api";
import DialogMessage from '@/projects/components/dialog/DialogMessage.vue'
import CenterLoading from '@/projects/components/dialog/CenterLoading.vue'

export default {
  name: 'Register',
  components: {
    DialogMessage,
    CenterLoading
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      licensePlate: '',
      role: 'user',
      showPassword: false,
      showConfirmPassword: false
    }
  },
  methods: {
    async onSignUp() {
      if (this.password !== this.confirmPassword) {
        this.$store.commit("dialog/dialog", {
          title: "Validation Error",
          message: "Passwords do not match.",
          code: "AUTH_PASSWORD_MISMATCH",
          number: "1",
          status: true
        });
        return;
      }

      this.$store.commit("dialog/loading", true);
      try {
        const payload = {
          username: this.username,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
          role: this.role,
          ...(this.role === 'user' ? { licensePlate: this.licensePlate } : {})
        };

        const response = await Service.authenticated('register', payload);
        this.$store.commit("dialog/loading", false);

        if (response && response.data && response.data.status) {
          this.$store.commit("dialog/dialog", {
            title: "Success",
            message: "Your account has been registered successfully! Please log in.",
            code: "AUTH_REGISTER_SUCCESS",
            number: "2",
            status: true
          });
          this.$router.push('/pages/login');
        } else {
          throw new Error('Registration failed');
        }
      } catch (err) {
        this.$store.commit("dialog/loading", false);
        const errMsg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Registration failed. Please check your inputs and try again.";
        const errCode = err.response && err.response.data && err.response.data.code
          ? err.response.data.code
          : "AUTH_REGISTER_FAILED";

        this.$store.commit("dialog/dialog", {
          title: "Registration Error",
          message: errMsg,
          code: errCode,
          number: "1",
          status: true
        });
      }
    }
  }
}
</script>

<style scoped>
.register-page-bg {
  background-color: #f4f5f7;
  min-height: 100vh;
}
.register-card {
  border: 1px solid #a31d1d;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.register-title {
  color: #1a1a1a;
  font-size: 2.2rem;
  margin-top: 10px;
}
.input-label {
  font-size: 14px;
  color: #333333;
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
.signin-link {
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
