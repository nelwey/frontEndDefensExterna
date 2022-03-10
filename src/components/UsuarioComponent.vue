<template>
  <v-app id="inspire">
    <v-alert
      :value="alertSucces"
      transition="slide-y-transition"
      type="success"
      elevation="10"
      width="300"
      >{{ alertMessage }}</v-alert
    >
    <v-alert
      :value="alertError"
      transition="slide-y-transition"
      type="error"
      elevation="10"
      width="300"
      >{{ alertMessage }}</v-alert
    >

    <!-- TABLA USUARIOS -->

    <v-data-table
      :loading="loading"
      loading-text="Cargando..."
      :headers="headersUsuario"
      :items="usuarioData.usuarios"
      :search="search"
      item-key="_id"
      :footer-props="{
        'items-per-page-options': [15, 20, 30, 40, 50],
      }"
      class="elevation-1 pa-5"
      :items-per-page="15"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Usuarios</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>

          <v-btn
            color="primary"
            dark
            class="mb-2"
            @click="isNuevoUsuarioModalOpen = true"
          >
            Nuevo Usuario
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="openDialogActualizarUsuario(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="openDialogEliminarUsuario(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <!-- NUEVO USUARIO MODAL -->
    <v-dialog v-model="isNuevoUsuarioModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Nuevo Usuario</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form
              ref="NuevoUsuarioForm"
              v-model="isNuevoUsuarioFormValid"
              lazy-validation
            >
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="usuarioData.nombreUsuario"
                    :rules="[nombreUsuarioRules.required]"
                    label="Nombre de Usuario"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    autocomplete="on"
                    v-model="usuarioData.password"
                    :rules="[passwordRules.required]"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show1 = !show1"
                    :type="show1 ? 'text' : 'password'"
                    label="Password"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    item-value="selectedRol"
                    v-model="usuarioData.selectedRol"
                    :rules="[rolRules.required]"
                    :items="usuarioData.roles"
                    :menu-props="{ maxHeight: '400' }"
                    label="Roles"
                    hint="Seleccione el rol"
                    persistent-hint
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-btn
                  color="error"
                  text
                  @click="isNuevoUsuarioModalOpen = false"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="guardarUsuario"
                  :disabled="!isNuevoUsuarioFormValid"
                >
                  Guardar
                </v-btn>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- ACTUALIZAR USUARIO MODAL -->
    <v-dialog v-model="isActualizarUsuarioModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Actualizar Usuario</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form
              ref="ActualizarUsuarioForm"
              v-model="isActualizarUsuarioFormValid"
              lazy-validation
            >
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="usuarioData.selectedUsuario.nombreUsuario"
                    :rules="[nombreUsuarioRules.required]"
                    label="Nombre de Usuario"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    autocomplete="on"
                    v-model="usuarioData.selectedUsuario.password"
                    :rules="[passwordRules.required]"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show1 = !show1"
                    :type="show1 ? 'text' : 'password'"
                    label="Password"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    item-value="usuarioData.selectedUsuario.rol.nombreRol"
                    item-text="usuarioData.selectedUsuario.rol.nombreRol"
                    v-model="usuarioData.selectedUsuario.rol.nombreRol"
                    :rules="[rolRules.required]"
                    :items="usuarioData.roles"
                    :menu-props="{ maxHeight: '400' }"
                    label="Roles"
                    hint="Seleccione el rol"
                    persistent-hint
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-btn
                  color="error"
                  text
                  @click="isActualizarUsuarioModalOpen = false"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="actualizarUsuario"
                  :disabled="!isActualizarUsuarioFormValid"
                >
                  Actualizar
                </v-btn>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- ELIMINAR USUARIO MODAL -->
    <v-dialog v-model="isEliminarUsuarioModalOpen" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Eliminar Usuario</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form
              ref="EliminarUsuarioForm"
              v-model="isEliminarUsuarioFormValid"
            >
              <v-row>
                Esta seguro que quiere eliminar el usuario
                {{ usuarioData.selectedUsuario.nombreUsuario }}?
              </v-row>
              <v-row>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="isEliminarUsuarioModalOpen = false"
                >
                  Cancelar
                </v-btn>
                <v-btn color="error" text @click="eliminarUsuario">
                  Eliminar
                </v-btn>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script>
import axios from "axios";
export default {
  name: "UsuarioComponent",
  data: () => ({
    // variables alerts
    alertSucces: false,
    alertError: false,
    alertMessage: "",

    // variables usuario data
    usuarioData: {
      nombreUsuario: "",
      password: "",
      selectedRol: "",
      selectedUsuario: {
        _id: "",
        nombreUsuario: "",
        password: "",
        rol: {},
      },
      roles: ["admin", "usuario"],
      usuarios: [],
    },

    //variables validacion
    nombreUsuarioRules: {
      required: (value) => !!value || "Nombre de usuario es requerido!.",
    },
    passwordRules: {
      required: (value) => !!value || "Contraseña es requerido!.",
    },
    rolRules: {
      required: (value) => !!value || "Rol es requerido!.",
    },

    //variables formulario
    isNuevoUsuarioModalOpen: false,
    isNuevoUsuarioFormValid: true,

    isActualizarUsuarioModalOpen: false,
    isActualizarUsuarioFormValid: true,

    isEliminarUsuarioModalOpen: false,
    isEliminarUsuarioFormValid: true,

    show1: false,

    // table data
    loading: false,
    headersUsuario: [
      {
        text: "Nombre Usuario",
        value: "nombreUsuario",
        align: "left",
      },
      { text: "Rol", value: "rol.nombreRol" },
      { text: "Acciones", value: "actions", sortable: false },
    ],
    search: "",

    dialogDelete: false,
    dialogUpdate: false,
    editedIndex: -1,
  }),

  props: {
    model: {},
    usuarioRol: {
      type: String,
    },
  },
  // computed: {
  //   setU
  // },
  created() {
    this.obtenerUsuarios();
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
    isNuevoUsuarioModalOpen(new_val) {
      if (!new_val) {
        this.$refs.NuevoUsuarioForm.reset();
      }
    },
  },

  methods: {
    async obtenerUsuarios() {
      try {
        const { data } = await axios.get("https://api-defensa-externa.herokuapp.com/api/usuarios", {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });
        console.log("[>] UsuarioComponent, obtenerUsuarios: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.usuarioData.usuarios = data.usuarios;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async guardarUsuario() {
      if (this.$refs.NuevoUsuarioForm.validate()) {
        try {
          const { data } = await axios.post(
            `https://api-defensa-externa.herokuapp.com/api/usuarios`,
            {
              nombreUsuario: this.usuarioData.nombreUsuario,
              password: this.usuarioData.password,
              rol: this.usuarioData.selectedRol,
            },
            {
              headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
              },
            }
          );
          console.log("[>] UsuarioComponent, guardarUsuario", data);
          if (data.ok) {
            setTimeout(() => {
              this.isNuevoUsuarioModalOpen = !this.isNuevoUsuarioModalOpen;
            }, 500);
            this.alertMessage = data.msg;
            this.alertSucces = true;
            this.obtenerUsuarios();
          }
        } catch (error) {
          console.error("[>] UsuarioComponent, guardarUsuario", error);
          setTimeout(() => {
            this.isNuevoUsuarioModalOpen = !this.isNuevoUsuarioModalOpen;
          }, 500);
          let mensaje = error.response.data.msg;
          this.alertError = true;
          this.alertMessage = mensaje;
        }
      }
    },
    async actualizarUsuario() {
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/usuarios/${this.usuarioData.selectedUsuario._id}`,
          {
            nombreUsuario: this.usuarioData.selectedUsuario.nombreUsuario,
            password: this.usuarioData.selectedUsuario.password,
            rol: this.usuarioData.selectedUsuario.rol.nombreRol,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("[>] UsuarioComponent, actualizarUsuario", data);
        if (data.ok) {
          setTimeout(() => {
            this.isActualizarUsuarioModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerUsuarios();
        }
      } catch (error) {
        console.error("[>] UsuarioComponent, actualizarUsuario", error);
        setTimeout(() => {
          this.isActualizarUsuarioModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    async eliminarUsuario() {
      try {
        const { data } = await axios.delete(
          `https://api-defensa-externa.herokuapp.com/api/usuarios/${this.usuarioData.selectedUsuario._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("[>] UsuarioComponent, eliminarUsuario", data);
        if (data.ok) {
          setTimeout(() => {
            this.isEliminarUsuarioModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerUsuarios();
        }
      } catch (error) {
        console.error("[>] UsuarioComponent, eliminarUsuario", error);
        setTimeout(() => {
          this.isEliminarUsuarioModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    openDialogActualizarUsuario(usuario) {
      console.log("[>] openDialogActualizarUsuario: ",usuario )
      this.usuarioData.selectedUsuario = Object.assign({}, usuario);
      this.isActualizarUsuarioModalOpen = true;
    },
    openDialogEliminarUsuario(usuario) {
      this.usuarioData.selectedUsuario = Object.assign({}, usuario);
      this.isEliminarUsuarioModalOpen = true;
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
  
