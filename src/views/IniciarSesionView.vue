<template>
  <v-app id="inspire">
    <v-dialog v-model="dialog2" persistent max-width="600px" min-width="360px">
      <v-alert
        :value="alertSucces"
        transition="scale-transition"
        type="success"
        elevation="10"
        width="300"
        >{{ alertMessage }}</v-alert
      >
      <v-alert
        :value="alertError"
        transition="scale-transition"
        type="error"
        elevation="10"
        width="300"
        >{{ alertMessage }}</v-alert
      >
    </v-dialog>
    <v-main>
      <v-container class="fill-height" fluid>
        <v-dialog
          v-model="dialog"
          persistent
          max-width="600px"
          min-width="360px"
        >
          <div>
            <v-tabs
              v-model="tab"
              show-arrows
              background-color="blue lighten-5 accent-4"
              icons-and-text
              dark
              grow
            >
              <v-tabs-slider color="purple darken-4"></v-tabs-slider>
              <v-tab v-for="i in tabs" :key="i.name">
                <v-icon large>{{ i.icon }}</v-icon>
                <div class="caption py-1">{{ i.name }}</div>
              </v-tab>
              <v-tab-item>
                <v-card class="px-4">
                  <v-card-text>
                    <v-form
                      ref="iniciarSesionForm"
                      v-model="isiniciarSesionFormValid"
                      lazy-validation
                    >
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            prepend-icon="mdi-account-circle"
                            v-model="nombreUsuario"
                            :rules="[nombreUsuarioRules.required]"
                            label="Nombre de Usuario"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            prepend-icon="mdi-lock"
                            autocomplete="on"
                            v-model="password"
                            :rules="[passwordRules.required]"
                            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="show1 = !show1"
                            :type="show1 ? 'text' : 'password'"
                            label="Password"
                            @keydown.enter="iniciarSesionEvent"
                          ></v-text-field>
                        </v-col>
                        <v-col class="d-flex" cols="12" sm="6" xsm="12">
                        </v-col>
                      </v-row>
                      <v-row no-gutters justify="space-around">
                        <v-col class="d-flex justify-center" cols="6">
                          <v-btn
                            block
                            :disabled="!isiniciarSesionFormValid"
                            color="success"
                            @click="iniciarSesionEvent"
                          >
                            Iniciar Sesión
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </div>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  name: "IniciarSesionView",

  data: () => ({
    // variables alert
    alertMessage: "",
    alertSucces: false,
    alertError: false,
    dialog: true,
    dialog2: true,

    //variables usuario
    nombreUsuario: "",
    password: "",
    tab: 0,
    tabs: [{ name: "Login", icon: "mdi-account" }],

    //variables validacion
    nombreUsuarioRules: {
      required: (value) => !!value || "El nombre de usuario es requerido!.",
    },
    passwordRules: {
      required: (value) => !!value || "La contraseña es requerido!.",
    },
    // variables formulario
    isiniciarSesionFormValid: true,
    show1: false,
  }),
  methods: {
    async iniciarSesionEvent() {
      if (this.$refs.iniciarSesionForm.validate()) {
        try {
          const { data } = await axios.post(
            `https://api-defensa-externa.herokuapp.com/api/autorizacion/iniciarsesion`,
            {
              nombreUsuario: this.nombreUsuario,
              password: this.password,
            }
          );
          console.log("[>] iniciarSesionView, iniciarSesionEvent :", data);
          if (data.ok) {
            this.alertSucces = true;
            this.alertMessage = data.msg;
            localStorage.token = data.token;
            localStorage.id = data.idUsuario;
            setTimeout(() => {
              this.$router.push({ name: "PanelAdministrativoView" });
              this.$refs.iniciarSesionForm.reset();
            }, 1500);
          }
        } catch (error) {
          let msg = error.response.data;
          this.alertError = true;
          this.alertMessage = msg;
        }
      }
    },
  },
  watch: {
    alertSucces(new_val) {
      if (new_val) {
        setTimeout(() => {
          this.alertSucces = false;
        }, 3000);
      }
    },
    alertError(new_val) {
      if (new_val) {
        setTimeout(() => {
          this.alertError = false;
        }, 3000);
      }
    },
  },
};
</script>
<style scoped>
.v-alert {
  position: fixed;
  left: 50%;
  bottom: 50px;
  transform: translate(-50%, -50%);
  margin: 0 auto;
}
</style>
  
