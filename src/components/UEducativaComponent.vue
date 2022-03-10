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

    <!-- TABLA UNIDADES EDUCATIVAS -->

    <v-data-table
      :loading="loading"
      loading-text="Cargando..."
      :headers="headers"
      :items="uEducativaData.uEducativas"
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
          <v-toolbar-title>Unidades Educativas</v-toolbar-title>
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
            @click="isNuevoModalOpen = true"
          >
            Nuevo
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
          <span class="text-h5">Nueva U. Educativa</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="NuevoForm" v-model="isNuevoFormValid" lazy-validation>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="uEducativaData.nombre"
                    label="Nombre"
                    type="text"
                    :rules="[nombreRules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="uEducativaData.ubicacion"
                    label="Ubicacion"
                    type="text"
                    :rules="[ubicacionRules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="uEducativaData.telefono"
                    label="Telefono"
                    type="number"
                    onKeyPress="if(this.value.length==8) return false;"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="uEducativaData.email"
                    label="Email"
                    type="text"
                    :rules="emailRules"
                  ></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-select
                    item-value="_id"
                    item-text="nombre"
                    v-model="uEducativaData.idUv._id"
                    :items="uvData.uvs"
                    :menu-props="{ maxHeight: '400' }"
                    label="UV"
                    hint="Seleccione UV"
                    persistent-hint
                    :rules="[uVRules.required]"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-btn color="error" text @click="isNuevoModalOpen = false">
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="guardarUeducativa"
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
          <span class="text-h5">Actualizar Unidad Educativa</span>
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
                    v-model="uEducativaData.selectedUeducativa.nombre"
                    :rules="[nombreRules.required]"
                    label="Nombre"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="uEducativaData.selectedUeducativa.ubicacion"
                    :rules="[ubicacionRules.required]"
                    label="Ubicacion"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="uEducativaData.selectedUeducativa.telefono"
                    label="Telefono"
                    type="number"
                    onKeyPress="if(this.value.length==8) return false;"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="uEducativaData.selectedUeducativa.email"
                    label="Email"
                    type="email"
                    :rules="emailRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    item-value="_id"
                    item-text="nombre"
                    v-model="uEducativaData.selectedUeducativa.idUv._id"
                    :items="uvData.uvs"
                    :menu-props="{ maxHeight: '400' }"
                    label="UV"
                    persistent-hint
                    :rules="[uVRules.required]"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-btn color="error" text @click="closeActualizarDialog">
                  Cancelar
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="actualizaruEducativa"
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
          <span class="text-h5">Eliminar Unidad Educativa</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="EliminarForm" v-model="isEliminarFormValid">
              <v-row>
                Esta seguro que quiere eliminar la unidad educativa
                {{ uEducativaData.selectedUeducativa.nombre }}?
              </v-row>
              <v-row>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="isEliminarModalOpen = false"
                >
                  Cancelar
                </v-btn>
                <v-btn color="error" text @click="eliminaruEducativa">
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
import utilities from "../utility/utilities";
export default {
  name: "UEducativaComponent",
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

    // variables u educativa data
    uEducativaData: {
      idUv: {
        _id: "",
        nombre: "",
        distrito: "",
      },
      nombre: "",
      ubicacion: "",
      telefono: null,
      email: "",
      selectedUeducativa: {
        _id: "",
        idUv: {
          _id: "",
          nombre: "",
          distrito: "",
        },
        nombre: "",
        ubicacion: "",
        telefono: null,
        email: "",
      },

      uEducativas: [],
    },

    //variables validacion
    nombreRules: {
      required: (value) => !!value || "Nombre es requerido!.",
    },
    ubicacionRules: {
      required: (value) => !!value || "Ubicacion es requerido!.",
    },
    uVRules: {
      required: (value) => !!value || "UV es requerido!.",
    },
    emailRules: [
      (v) =>
        !v ||
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        "Email no valido",
    ],

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
        text: "UV",
        value: "idUv.nombre",
        align: "left",
      },
      { text: "Nombre", value: "nombre" },
      { text: "Ubicacion", value: "ubicacion" },
      { text: "Telefono", value: "telefono" },
      { text: "Email", value: "email" },
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
    this.obtenerUeducativas();
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
        const { data } = await axios.get(
          "https://api-defensa-externa.herokuapp.com/api/uvs",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("UEducativaComponent > obtenerUvs: ", data);
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
    async obtenerUeducativas() {
      try {
        const { data } = await axios.get(
          "https://api-defensa-externa.herokuapp.com/api/ueducativas",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("UEducativaComponent > obtenerUeducativas: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.uEducativaData.uEducativas = data.uEducativas;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenerUeducativaById(id) {
      try {
        const { data } = await axios.get(
          `https://api-defensa-externa.herokuapp.com/api/ueducativa/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("UEducativaComponent > obtenerUeducativaById: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.uEducativaData.selectedUeducativa = data.uEducativa;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async guardarUeducativa() {
      if (this.$refs.NuevoForm.validate()) {
        try {
          const { data } = await axios.post(
            `https://api-defensa-externa.herokuapp.com/api/ueducativa`,
            {
              idUv: this.uEducativaData.idUv._id,
              nombre: this.uEducativaData.nombre,
              ubicacion: this.uEducativaData.ubicacion,
              telefono: this.uEducativaData.telefono,
              email: this.uEducativaData.email,
            },
            {
              headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
              },
            }
          );
          console.log("UEducativaComponent > guardarUeducativa: ", data);
          if (data.ok) {
            setTimeout(() => {
              this.isNuevoModalOpen = !this.isNuevoModalOpen;
            }, 500);
            this.alertMessage = data.msg;
            this.alertSucces = true;
            this.obtenerUeducativas();
          }
        } catch (error) {
          console.log(
            "UEducativaComponent > guardarUeducativa > error: ",
            error
          );
          setTimeout(() => {
            this.isNuevoModalOpen = false;
          }, 500);
          let mensaje = error.response.data.msg;
          this.alertError = true;
          this.alertMessage = mensaje;
        }
      }
    },
    async actualizaruEducativa() {
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/ueducativa/${this.uEducativaData.selectedUeducativa._id}`,
          {
            idUv: this.uEducativaData.selectedUeducativa.idUv._id,
            nombre: this.uEducativaData.selectedUeducativa.nombre,
            ubicacion: this.uEducativaData.selectedUeducativa.ubicacion,
            telefono: this.uEducativaData.selectedUeducativa.telefono,
            email: this.uEducativaData.selectedUeducativa.email,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("UEducativaComponent > actualizaruEducativa: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isActualizarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerUeducativas();
        }
      } catch (error) {
        console.log(
          "UEducativaComponent > actualizaruEducativa > error: ",
          error
        );
        setTimeout(() => {
          this.isActualizarModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    async eliminaruEducativa() {
      try {
        const { data } = await axios.delete(
          `https://api-defensa-externa.herokuapp.com/api/ueducativa/${this.uEducativaData.selectedUeducativa._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("UEducativaComponent > eliminaruEducativa: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isEliminarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerUeducativas();
        }
      } catch (error) {
        console.log("UEducativaComponent > eliminaruEducativa > error: ", data);
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
    openDialogActualizar(ueducativa) {
      this.obtenerUeducativaById(ueducativa._id);
      this.isActualizarModalOpen = true;
    },
    openDialogEliminar(ueducativa) {
      this.uEducativaData.selectedUeducativa = Object.assign({}, ueducativa);
      this.isEliminarModalOpen = true;
    },
    toPDF() {
      const arreglo = [
        { title: "UV", dataKey: "idUv", displayProperty: "nombre" },
        { title: "NOMBRE", dataKey: "nombre" },
        { title: "UBICACION", dataKey: "ubicacion" },
        { title: "TELEFONO", dataKey: "telefono" },
        { title: "EMAIL", dataKey: "email" },
      ];
      utilities.generatePDF(
        "Listado de Unidades Educativas",
        arreglo,
        this.uEducativaData.uEducativas,
        ""
      );
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
  
