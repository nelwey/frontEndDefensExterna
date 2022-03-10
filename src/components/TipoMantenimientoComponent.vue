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

    <!-- TABLA TIPO MANTENIMIENTO -->

    <v-data-table
      :loading="loading"
      loading-text="Cargando..."
      :headers="headers"
      :items="tipoMantenimientoData.tipoMantenimientos"
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
          <v-toolbar-title>Tipo de Mantenimiento</v-toolbar-title>
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
          v-if="usuarioRol == 'admin'"
            color="primary"
            dark
            class="mb-2"
            @click="isNuevoModalOpen = true"
          >
            Nuevo
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="openDialogActualizar(item)">
          mdi-pencil
        </v-icon>
        <v-icon  v-if="usuarioRol == 'admin'" small @click="openDialogEliminar(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>

    <!-- NUEVO MODAL -->
    <v-dialog v-model="isNuevoModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Nuevo Tipo de Mantenimiento</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="NuevoForm" v-model="isNuevoFormValid" lazy-validation>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="tipoMantenimientoData.nombre"
                    label="Nombre"
                    type="text"
                    :rules="[nombreRules.required]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-btn color="error" text @click="isNuevoModalOpen = false">
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="guardarTipoMantenimiento"
                  :disabled="!isNuevoFormValid"
                >
                  Guardar
                </v-btn>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- ACTUALIZAR MODAL -->
    <v-dialog v-model="isActualizarModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Actualizar Tipo de Mantenimiento</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form
              ref="ActualizarForm"
              v-model="isActualizarFormValid"
              lazy-validation
            >
              <v-row>
                <v-col cols="12" >
                  <v-text-field
                    v-model="tipoMantenimientoData.selectedtipoMantenimiento.nombre"
                    :rules="[nombreRules.required]"
                    label="Nombre"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-btn color="error" text @click="closeActualizarDialog">
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="actualizarTipoMantenimiento"
                  :disabled="!isActualizarFormValid"
                >
                  Actualizar
                </v-btn>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- ELIMINAR MODAL -->
    <v-dialog v-model="isEliminarModalOpen" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Eliminar Tipo de Mantenimiento</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="EliminarForm" v-model="isEliminarFormValid">
              <v-row>
                Esta seguro que quiere eliminar el tipo de mantenimiento '
                {{ tipoMantenimientoData.selectedtipoMantenimiento.nombre }}' ?
              </v-row>
              <v-row>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="isEliminarModalOpen = false"
                >
                  Cancelar
                </v-btn>
                <v-btn color="error" text @click="eliminarTipoMantenimiento">
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
  name: "TipoMantenimientoComponent",
  data: () => ({
    // variables alerts
    alertSucces: false,
    alertError: false,
    alertMessage: "",

    // variables tipo mantenimiento data
    tipoMantenimientoData: {
      nombre: "",
      selectedtipoMantenimiento: {
        _id: "",
        nombre: "",
      },

      tipoMantenimientos: [],
    },

    //variables validacion
    nombreRules: {
      required: (value) => !!value || "Nombre es requerido!.",
    },

    //variables formulario
    isNuevoModalOpen: false,
    isNuevoFormValid: true,

    isActualizarModalOpen: false,
    isActualizarFormValid: true,

    isEliminarModalOpen: false,
    isEliminarFormValid: true,

    show1: false,

    // table data
    loading: false,
    headers: [
      {
        text: "Nombre",
        value: "nombre",
        align: "left",
      },
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
  computed: {},
  created() {
    this.obtenertipoMantenimientos();
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
    isNuevoModalOpen(new_val) {
      if (!new_val) {
        this.$refs.NuevoForm.reset();
      }
    },
  },

  methods: {
    async obtenertipoMantenimientos() {
      try {
        const { data } = await axios.get("https://api-defensa-externa.herokuapp.com/api/tipoMantenimientos", {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });
        console.log("TipoMantenimientoComponent > obtenertipoMantenimientos: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.tipoMantenimientoData.tipoMantenimientos = data.tipoMantenimientos;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenertipoMantenimientoById(id) {
      try {
        const { data } = await axios.get(
          `https://api-defensa-externa.herokuapp.com/api/tipoMantenimiento/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("TipoMantenimientoComponent > obtenertipoMantenimientoById: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.tipoMantenimientoData.selectedtipoMantenimiento = data.tipoMantenimiento;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async guardarTipoMantenimiento() {
      if (this.$refs.NuevoForm.validate()) {
        try {
          const { data } = await axios.post(
            `https://api-defensa-externa.herokuapp.com/api/tipoMantenimiento`,
            {
              nombre: this.tipoMantenimientoData.nombre,
            },
            {
              headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
              },
            }
          );
           console.log("TipoMantenimientoComponent > guardarTipoMantenimiento: ", data);
          if (data.ok) {
            setTimeout(() => {
              this.isNuevoModalOpen = !this.isNuevoModalOpen;
            }, 500);
            this.alertMessage = data.msg;
            this.alertSucces = true;
            this.obtenertipoMantenimientos();
          }
        } catch (error) {
          console.log("UEducativaComponent > guardarUeducativa > error: ", error);
          setTimeout(() => {
            this.isNuevoModalOpen = false;
          }, 500);
          let mensaje = error.response.data.msg;
          this.alertError = true;
          this.alertMessage = mensaje;
        }
      }
    },
    async actualizarTipoMantenimiento() {
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/tipoMantenimiento/${this.tipoMantenimientoData.selectedtipoMantenimiento._id}`,
          {
            nombre: this.tipoMantenimientoData.selectedtipoMantenimiento.nombre,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
       console.log("TipoMantenimientoComponent > actualizaruEducativa: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isActualizarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenertipoMantenimientos();
        }
      } catch (error) {
       console.log("TipoMantenimientoComponent > actualizaruEducativa > error: ", error);
        setTimeout(() => {
          this.isActualizarModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    async eliminarTipoMantenimiento() {
      try {
        const { data } = await axios.delete(
          `https://api-defensa-externa.herokuapp.com/api/tipoMantenimiento/${this.tipoMantenimientoData.selectedtipoMantenimiento._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("TipoMantenimientoComponent > eliminarTipoMantenimiento: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isEliminarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenertipoMantenimientos();
        }
      } catch (error) {
        console.log("TipoMantenimientoComponent > eliminarTipoMantenimiento > error: ", error);
        setTimeout(() => {
          this.isEliminarModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    closeActualizarDialog() {
      this.isActualizarModalOpen = false;
      this.$refs.ActualizarForm.reset();
    },
    openDialogActualizar(object) {
      this.obtenertipoMantenimientoById(object._id);
      this.isActualizarModalOpen = true;
    },
    openDialogEliminar(object) {
      this.tipoMantenimientoData.selectedtipoMantenimiento = Object.assign({}, object);
      this.isEliminarModalOpen = true;
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
  
