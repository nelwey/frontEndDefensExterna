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

    <!-- TABLA UV -->

    <v-data-table
      :loading="loading"
      loading-text="Cargando..."
      :headers="headers"
      :items="uvData.uvs"
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
          <v-toolbar-title>Uvs</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>

          <v-btn
            color="primary"
            dark
            class="mb-2"
            @click="isNuevoModalOpen = true"
          >
            Nuevo Uv
          </v-btn>
          
          <v-spacer></v-spacer>
          <v-btn color="secondary" dark class="mb-2" @click="toPDF">
            Generar PDF
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="openDialogActualizar(item)">
          mdi-pencil
        </v-icon>
        <v-icon
          v-if="usuarioRol == 'admin'"
          small
          @click="openDialogEliminar(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <!-- NUEVO MODAL -->
    <v-dialog v-model="isNuevoModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Nuevo Uv</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="NuevoForm" v-model="isNuevoFormValid" lazy-validation>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="uvData.nombre"
                    :rules="[nombreRules.required]"
                    label="Nombre"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="uvData.distrito"
                    :rules="[distritoRules.required]"
                    label="Distrito"
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
                  @click="guardarUv"
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
          <span class="text-h5">Actualizar UV</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form
              ref="ActualizarForm"
              v-model="isActualizarFormValid"
              lazy-validation
            >
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="uvData.selectedUv.nombre"
                    :rules="[nombreRules.required]"
                    label="Nombre"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="uvData.selectedUv.distrito"
                    :rules="[distritoRules.required]"
                    label="Distrito"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-btn
                  color="error"
                  text
                  @click="isActualizarModalOpen = false"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="actualizarUv"
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
    <!-- ELIMINAR PACIENTE MODAL -->
    <v-dialog v-model="isEliminarModalOpen" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Eliminar Uv</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="EliminarForm" v-model="isEliminarModalOpen">
              <v-row>
                Esta seguro que quiere eliminar el uv
                {{ uvData.selectedUv.nombre }}?
              </v-row>
              <v-row>
                <v-btn
                  color="secondary"
                  text
                  @click="isEliminarModalOpen = false"
                >
                  Cancelar
                </v-btn>
                <v-btn color="error" text @click="eliminarUv"> Eliminar </v-btn>
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
import moment from "moment";
import utilities from "../utility/utilities";

export default {
  name: "UvComponent",
  data: () => ({
    // variables alerts
    alertSucces: false,
    alertError: false,
    alertMessage: "",

    // variables uv data
    uvData: {
      nombre: "",
      distrito: "",
      uvs: [],
      selectedUv: {
        _id: "",
        nombre: "",
        distrito: "",
      },
    },
    //variables validacion
    nombreRules: {
      required: (value) => !!value || "nombre es requerido!",
    },
    distritoRules: {
      required: (value) => !!value || "distrito es requerido!",
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
        text: "ID",
        value: "_id",
        align: "left",
      },
      { text: "nombre", value: "nombre" },
      { text: "distrito", value: "distrito" },
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
  created() {
    this.obtenerUvs();
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
    async obtenerUvs() {
      try {
        const { data } = await axios.get("https://api-defensa-externa.herokuapp.com/api/uvs", {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });
        console.log("uvComponent > obtenerUvs: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.uvData.uvs = data.uvs;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async guardarUv() {
      if (this.$refs.NuevoForm.validate()) {
        try {
          const { data } = await axios.post(
            `https://api-defensa-externa.herokuapp.com/api/uv`,
            {
              nombre: this.uvData.nombre,
              distrito: this.uvData.distrito,
            },
            {
              headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
              },
            }
          );
          console.log("UvComponent > guardarUv: ", data);
          if (data.ok) {
            setTimeout(() => {
              this.isNuevoModalOpen = !this.isNuevoModalOpen;
            }, 500);
            this.alertMessage = data.msg;
            this.alertSucces = true;
            this.obtenerUvs();
          }
        } catch (error) {
          console.log("UvComponent > guardarUv > error: ", error);
          setTimeout(() => {
            this.isNuevoModalOpen = !this.isNuevoModalOpen;
          }, 500);
          let mensaje = error.response.data.msg;
          this.alertError = true;
          this.alertMessage = mensaje;
        }
      }
    },
    async actualizarUv() {
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/uv/${this.uvData.selectedUv._id}`,
          {
            nombre: this.uvData.selectedUv.nombre,
            distrito: this.uvData.selectedUv.distrito,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("UvComponent > actualizar", data);
        if (data.ok) {
          setTimeout(() => {
            this.isActualizarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerUvs();
        }
      } catch (error) {
        console.log("UvComponent > actualizar > error: ", error);
        setTimeout(() => {
          this.isActualizarModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    async eliminarUv() {
      try {
        const { data } = await axios.delete(
          `https://api-defensa-externa.herokuapp.com/api/uv/${this.uvData.selectedUv._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("UvComponent > eliminar", data);
        if (data.ok) {
          setTimeout(() => {
            this.isEliminarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerUvs();
        }
      } catch (error) {
        console.log("UvComponent > eliminar > error: ", data);
        setTimeout(() => {
          this.isEliminarModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    openDialogActualizar(uv) {
      this.uvData.selectedUv = Object.assign({}, uv);
      this.isActualizarModalOpen = true;
    },
    openDialogEliminar(uv) {
      this.uvData.selectedUv = Object.assign({}, uv);
      this.isEliminarModalOpen = true;
    },
    toPDF() {
      const arreglo = [
        { title: "ID", dataKey: "_id" },
        { title: "NOMBRE", dataKey: "nombre" },
        { title: "DISTRITO", dataKey: "distrito" },
      ];
      utilities.generatePDF("Listado de Unidades Vecinales", arreglo, this.uvData.uvs,"");
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
  
