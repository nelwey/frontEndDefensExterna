<template v-else>
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

    <v-container>
      <v-row>
        <v-col cols="4">
          <v-select
            dense
            solo
            :items="solicitudMantenimientoToggle"
            v-model="solicitudMantenimientoToggleModel"
            @input="solicitudMantenimientoToggleEvent"
          ></v-select>
        </v-col>
        <!-- TABLA SOLICITUD -->
        <v-col cols="12">
          <v-data-table
            v-if="tableSolicitudHide"
            :loading="loading"
            loading-text="Cargando..."
            :headers="headers"
            :items="solicitudData.solicitudes"
            :search="search"
            item-key="_id"
            :footer-props="{
              'items-per-page-options': [10, 20, 30, 40, 50],
            }"
            class="elevation-1 pa-5"
            :items-per-page="10"
            :custom-sort="customSort"
          >
            <template v-slot:top>
              <v-container fluid>
                <v-row>
                  <v-col cols="auto">
                    <v-toolbar flat>
                      <v-toolbar-title>Solicitudes</v-toolbar-title>
                    </v-toolbar>
                  </v-col>
                  <v-col cols="auto">
                    <v-text-field
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="auto">
                    <v-select
                      v-model="estadoSolicitud"
                      :items="estadoSolicitudes"
                      label="Estado"
                      @input="filtrarEstadoEvent"
                      clearable
                    ></v-select>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn
                      color="primary"
                      dark
                      class="mb-2"
                      @click="isNuevoModalOpen = true"
                    >
                      Nuevo
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn color="secondary" dark class="mb-2" @click="toPDF">
                      Generar PDF
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
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
              <v-btn
                v-if="item.estado == 'pendiente'"
                color="success"
                dark
                x-small
                class="mb-2"
                @click="openDialogAprobar(item)"
              >
                Aprobar
              </v-btn>
              <v-btn
                v-if="item.estado !== 'pendiente'"
                color="secondary"
                dark
                x-small
                class="mb-2"
                @click="openDialogInfo(item)"
              >
                Ver Mantenimientos
              </v-btn>
            </template>
          </v-data-table>

          <MantenimientoComponent
            v-if="!tableSolicitudHide"
            :model-data="'Mantenimiento'"
            :usuarioRol="usuarioRol.nombreRol"
          />

          <!--  INFO MODAL -->
          <v-dialog v-model="isInfoModalOpen" max-width="800px">
            <v-card>
              <v-card-text>
                <v-container>
                  <v-form>
                    <v-row>
                      <v-col cols="12">
                        <v-list dense disabled>
                          <v-subheader>LISTA DE MANTENIMIENTOS</v-subheader>
                          <v-list-item-group>
                            <v-list-item
                              v-for="(
                                mantenimiento, i
                              ) in solicitudData.mantenimientos"
                              :key="i"
                            >
                              <v-list-item-icon>
                                <v-icon small color="secondary"
                                  >mdi-wrench</v-icon
                                >
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title
                                  v-text="
                                    `${mantenimiento._id} - ${mantenimiento.idTipoMantenimiento.nombre} - ${mantenimiento.estado} `
                                  "
                                ></v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list-item-group>
                        </v-list>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>

          <!--  NUEVO MODAL -->
          <v-dialog v-model="isNuevoModalOpen" max-width="800px">
            <v-card>
              <v-card-title>
                <span class="text-h5">Nueva Solicitud</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form
                    ref="NuevoForm"
                    v-model="isNuevoFormValid"
                    lazy-validation
                  >
                    <v-row>
                      <v-col cols="6">
                        <v-select
                          item-value="_id"
                          item-text="nombre"
                          v-model="uvData.selectedUv._id"
                          :items="uvData.uvs"
                          :menu-props="{ maxHeight: '400' }"
                          label="UV"
                          hint="Seleccione UV"
                          persistent-hint
                          clearable
                          @input="filtrarUVEvent"
                        ></v-select>
                      </v-col>
                      <v-col cols="6">
                        <v-select
                          item-value="_id"
                          item-text="nombre"
                          v-model="ueData.selectedUeducativa._id"
                          :items="ueData.uEducativas"
                          :menu-props="{ maxHeight: '400' }"
                          label="U.E"
                          hint="Seleccione U.Educativa"
                          persistent-hint
                          clearable
                          :disabled="ueData.disabled"
                          @input="filtrarUEEvent"
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          autocomplete="descripcion"
                          label="Descripcion"
                          :disabled="ueData.disabled"
                          v-model="solicitudData.descripcion"
                        >
                        </v-textarea>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-btn
                        color="error"
                        text
                        @click="isNuevoModalOpen = false"
                      >
                        Cancelar
                      </v-btn>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="guardarSolicitud"
                        :disabled="saveButtonDisabled"
                      >
                        Guardar
                      </v-btn>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>
          <!-- APROBAR MODAL -->
          <v-dialog v-model="isAprobarModalOpen" max-width="800px">
            <v-card>
              <v-card-title>
                <span class="text-h5">Agregar Mantenimientos</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form
                    label="Descripcion"
                    ref="AprobarForm"
                    v-model="isAprobarFormValid"
                    lazy-validation
                  >
                    <v-row>
                      <v-col cols="12">
                        <div
                          v-for="(
                            textField, i
                          ) in tipoMantenimientoData.textField"
                          :key="i"
                        >
                          <v-row>
                            <v-col cols="11">
                              <v-select
                                v-model="textField.idTipoMantenimiento"
                                item-value="_id"
                                item-text="nombre"
                                color="primary"
                                label="Tipo de Mantenimiento"
                                prepend-inner-icon="mdi-hammer-screwdriver"
                                :items="
                                  tipoMantenimientoData.tipoMantenimientos
                                "
                              >
                              </v-select>
                            </v-col>
                            <v-col cols="1">
                              <v-btn
                                class="mx-2"
                                small
                                fab
                                dark
                                color="error"
                                @click="removeTipoMantenimientoEvent(i)"
                              >
                                <v-icon dark> mdi-minus </v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <v-btn
                          @click="addTipoMantenimientoEvent"
                          class="primary"
                          >Agregar Mantenimiento</v-btn
                        >
                      </v-col>
                      <v-col cols="6">
                        <v-btn
                          @click="guardarMantenimientos"
                          class="success"
                          v-if="tipoMantenimientoData.btnAprobar"
                          >Aprobar</v-btn
                        >
                      </v-col>
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
                <span class="text-h5">Actualizar Solicitud</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form
                    ref="ActualizarForm"
                    v-model="isActualizarFormValid"
                    lazy-validation
                  >
                    <v-row>
                      <v-col cols="12">
                        <v-select
                          v-model="solicitudData.selectedSolicitud.estado"
                          :items="estadoSolicitudes"
                          :menu-props="{ maxHeight: '400' }"
                          @input="toggleEstadoEvent"
                        ></v-select>
                      </v-col>
                      <v-col cols="6">
                        <v-select
                          item-value="_id"
                          item-text="nombre"
                          v-model="uvData.selectedUv._id"
                          :items="uvData.uvs"
                          :menu-props="{ maxHeight: '400' }"
                          label="UV"
                          hint="Seleccione UV"
                          persistent-hint
                          clearable
                          @input="filtrarUVEvent"
                        ></v-select>
                      </v-col>
                      <v-col cols="6">
                        <v-select
                          item-value="_id"
                          item-text="nombre"
                          v-model="solicitudData.selectedSolicitud.idUEducativa"
                          :items="ueData.uEducativas"
                          :menu-props="{ maxHeight: '400' }"
                          label="U.E"
                          hint="Seleccione U.Educativa"
                          persistent-hint
                          clearable
                          :disabled="ueData.disabled"
                          @input="filtrarUEEvent"
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          autocomplete="descripcion"
                          label="Descripcion"
                          :disabled="ueData.disabled"
                          v-model="solicitudData.selectedSolicitud.descripcion"
                        >
                        </v-textarea>
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
                        @click="actualizarSolicitud"
                        :disabled="saveButtonDisabled"
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
                <span class="text-h5">Eliminar Solicitud</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form ref="EliminarForm" v-model="isEliminarFormValid">
                    <v-row>
                      Esta seguro que quiere eliminar la solicitud con ID '{{
                        solicitudData.selectedSolicitud._id
                      }}'?
                    </v-row>
                    <v-row>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="isEliminarModalOpen = false"
                      >
                        Cancelar
                      </v-btn>
                      <v-btn color="error" text @click="eliminaruSolicitud">
                        Eliminar
                      </v-btn>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>



<script>
import axios from "axios";
import utilities from "../utility/utilities";
import MantenimientoComponent from "../components/MantenimientoComponent.vue";

export default {
  name: "SolicitudComponent",
  components: {
    MantenimientoComponent,
  },
  data: () => ({
    //variable otros
    solicitudMantenimientoToggle: ["Solicitudes", "Mantenimientos"],
    solicitudMantenimientoToggleModel: "",

    // variables alerts
    alertSucces: false,
    alertError: false,
    alertMessage: "",

    //variables tipo Mantenimiento
    tipoMantenimientoData: {
      textField: [],
      tipoMantenimientos: [],
      btnAprobar: false,
    },

    // variables buttons
    saveButtonDisabled: true,

    //variables ue data
    ueData: {
      disabled: true,
      uEducativas: [],
      selectedUeducativa: {
        _id: "",
      },
    },

    // variables uv data
    uvData: {
      nombre: "",
      distrito: "",
      uvs: [],
      selectedUv: {
        _id: "",
      },
    },
    // variables filtrado
    //estado
    estadoSolicitudes: ["pendiente", "aprobada", "archivada"],
    estadoSolicitud: "",
    //UE

    // variables solicitudes data
    solicitudData: {
      idUEducativa: {
        _id: "",
        nombre: "",
      },
      fecha: "",
      descripcion: "",
      estado: "",
      selectedSolicitud: {
        _id: "",
        idUEducativa: {
          _id: "",
          nombre: "",
        },
        fecha: "",
        descripcion: "",
        estado: "",
        mantenimientos: [],
      },

      solicitudes: [],
    },

    //variables validacion
    descripcion: {
      required: (value) => !!value || "Descripcion es requerido!.",
    },

    //variables formulario
    isNuevoModalOpen: false,
    isNuevoFormValid: true,

    isActualizarModalOpen: false,
    isActualizarFormValid: true,

    isEliminarModalOpen: false,
    isEliminarFormValid: true,

    isAprobarModalOpen: false,
    isAprobarFormValid: true,

    isInfoModalOpen: false,

    show1: false,

    // table data
    loading: false,
    headers: [
      {
        text: "ID",
        value: "_id",
        align: "left",
      },
      { text: "Unidad Vecinal", value: "idUEducativa.idUv.nombre" },
      { text: "Unidad Educativa", value: "idUEducativa.nombre" },
      { text: "Fecha", value: "fecha" },
      { text: "Estado", value: "estado" },
      { text: "Acciones", value: "actions", sortable: false },
    ],
    search: "",
    tableSolicitudHide: true,

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
    this.solicitudMantenimientoToggleModel =
      this.solicitudMantenimientoToggle[0];
    this.obtenerSolicitudes();
    this.obtenerUvs();
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
    async obtenerUvs() {
      try {
        const { data } = await axios.get("https://api-defensa-externa.herokuapp.com/api/uvs", {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });
        console.log("SolicitudComponent > obtenerUvs: ", data);
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
    async obtenertipoMantenimientos() {
      try {
        const { data } = await axios.get(
          "https://api-defensa-externa.herokuapp.com/api/tipoMantenimientos",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("SolicitudComponent > obtenertipoMantenimientos: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.tipoMantenimientoData.tipoMantenimientos =
              data.tipoMantenimientos;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenerSolicitudes() {
      try {
        const { data } = await axios.get(
          "https://api-defensa-externa.herokuapp.com/api/solicitudes",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("SolicitudComponent > obtenerSolicitudes: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.solicitudData.solicitudes = data.solicitudes;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenerSolicitudById(id) {
      try {
        const { data } = await axios.get(
          `https://api-defensa-externa.herokuapp.com/api/solicitud/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("SolicitudComponent > obtenerSolicitudById: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.solicitudData.selectedSolicitud = data.solicitud;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenerMantenimientosBySolicitudId(id) {
      try {
        const { data } = await axios.post(
          `https://api-defensa-externa.herokuapp.com/api/mantenimientosByIdSolicitud`,
          {
            idSolicitud: id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log(
          "SolicitudComponent > obtenerMantenimientosBySolicitudId: ",
          data
        );
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.solicitudData.mantenimientos = data.mantenimientos;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenerSolicitudesByEstado() {
      try {
        const { data } = await axios.post(
          `https://api-defensa-externa.herokuapp.com/api/solicitudesByEstado`,
          {
            estado: this.estadoSolicitud,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("SolicitudComponent > obtenerSolicitudesPorEstado: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.solicitudData.solicitudes = data.solicitudes;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenerUeducativaByUV() {
      try {
        const { data } = await axios.post(
          `https://api-defensa-externa.herokuapp.com/api/ueducativasByUV`,
          {
            idUv: this.uvData.selectedUv._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("SolicitudComponent > obtenerUeducativaByUV: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.ueData.uEducativas = data.uEducativas;
            this.loading = false;
          }, 500);
          this.ueData.disabled = false;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async guardarSolicitud() {
      if (this.$refs.NuevoForm.validate()) {
        try {
          const { data } = await axios.post(
            `https://api-defensa-externa.herokuapp.com/api/solicitud`,
            {
              idUEducativa: this.ueData.selectedUeducativa._id,
              fecha: new Date(),
              descripcion: this.solicitudData.descripcion,
              estado: "pendiente",
            },
            {
              headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
              },
            }
          );
          console.log("SolicitudComponent > guardarSolicitud: ", data);
          if (data.ok) {
            setTimeout(() => {
              this.isNuevoModalOpen = !this.isNuevoModalOpen;
            }, 500);
            this.alertMessage = data.msg;
            this.alertSucces = true;
            this.obtenerSolicitudes();
          }
        } catch (error) {
          console.log("SolicitudComponent > guardarSolicitud > error: ", error);
          setTimeout(() => {
            this.isNuevoModalOpen = false;
          }, 500);
          let mensaje = error.response.data.msg;
          this.alertError = true;
          this.alertMessage = mensaje;
        }
      }
    },
    async guardarMantenimientos() {
      if (this.$refs.AprobarForm.validate()) {
        try {
          this.tipoMantenimientoData.textField.forEach((item) => {
            axios
              .post(
                `https://api-defensa-externa.herokuapp.com/api/mantenimiento`,
                {
                  idSolicitud: this.solicitudData.selectedSolicitud._id,
                  idTipoMantenimiento: item.idTipoMantenimiento,
                  fechaInicio: new Date(),
                  fechaFin: "",
                  estado: "proceso",
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token"),
                  },
                }
              )
              .then((result) => {
                if (result.data.ok) {
                  this.solicitudData.selectedSolicitud.estado = "aprobada";
                  this.actualizarSolicitud();
                  this.solicitudMantenimientoToggleModel =
                    this.solicitudMantenimientoToggle[1];
                  this.alertMessage = result.data.msg;
                  this.alertSucces = true;
                  this.tableSolicitudHide = false;
                  this.isAprobarModalOpen = false;
                  console.log("Mantenimiento creado > data: ", result);
                } else {
                  console.log("Sth went wrong: ", result);
                }
              });
          });
        } catch (error) {
          console.log(
            "SolicitudComponent > guardarMantenimientos > error: ",
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
    async actualizarSolicitud() {
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/solicitud/${this.solicitudData.selectedSolicitud._id}`,
          {
            idUEducativa: this.solicitudData.selectedSolicitud.idUEducativa,
            fecha: this.solicitudData.selectedSolicitud.fecha,
            descripcion: this.solicitudData.selectedSolicitud.descripcion,
            estado: this.solicitudData.selectedSolicitud.estado,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("SolicitudComponent > actualizarSolicitud: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isActualizarModalOpen = false;
            this.saveButtonDisabled = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerSolicitudes();
        }
      } catch (error) {
        console.log(
          "SolicitudComponent > actualizarSolicitud > error: ",
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
    async eliminaruSolicitud() {
      try {
        const { data } = await axios.delete(
          `https://api-defensa-externa.herokuapp.com/api/solicitud/${this.solicitudData.selectedSolicitud._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("SolicitudComponent > eliminaruSolicitud: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isEliminarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerSolicitudes();
        }
      } catch (error) {
        console.log("SolicitudComponent > eliminaruSolicitud > error: ", error);
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
    openDialogAprobar(solicitud) {
      this.obtenerSolicitudById(solicitud._id);
      this.tipoMantenimientoData.textField = [];
      this.tipoMantenimientoData.btnAprobar = false;
      this.isAprobarModalOpen = true;
    },
    openDialogActualizar(solicitud) {
      this.obtenerSolicitudById(solicitud._id);
      this.saveButtonDisabled = true;
      this.isActualizarModalOpen = true;
    },
    openDialogEliminar(solicitud) {
      this.solicitudData.selectedSolicitud = Object.assign({}, solicitud);
      this.isEliminarModalOpen = true;
    },
    openDialogInfo(solicitud) {
      console.log("openDialogInfo: ", solicitud);
      this.obtenerMantenimientosBySolicitudId(solicitud._id);
      this.isInfoModalOpen = true;
    },
    toPDF() {
      const arreglo = [
        {
          title: "UNIDAD EDUCATIVA",
          dataKey: "idUEducativa",
          displayProperty: "nombre",
        },
        { title: "FECHA", dataKey: "fecha" },
        { title: "DESCRIPCION", dataKey: "descripcion" },
        { title: "ESTADO", dataKey: "estado" },
      ];
      utilities.generatePDF(
        "Solicitudes",
        arreglo,
        this.solicitudData.solicitudes,
        ""
      );
    },
    filtrarEstadoEvent() {
      if (this.estadoSolicitud == null) {
        this.obtenerSolicitudes();
      }
      this.obtenerSolicitudesByEstado();
    },
    filtrarUVEvent() {
      console.log(
        "filtrarUVEvent > uvData.selectedUv: ",
        this.uvData.selectedUv
      );
      console.log("filtrarUVEvent > ueData.disabled: ", this.ueData.disabled);
      if (this.uvData.selectedUv._id === null) {
        this.saveButtonDisabled = true;
        this.ueData.disabled = true;
      } else {
        this.obtenerUeducativaByUV();
      }
    },
    filtrarUEEvent() {
      console.log("filtrarUVEvent > ueData.disabled: ", this.ueData.disabled);
      if (this.ueData.selectedUeducativa._id === null) {
        this.saveButtonDisabled = true;
      } else {
        this.saveButtonDisabled = false;
      }
    },
    toggleEstadoEvent() {
      this.saveButtonDisabled = false;
    },
    addTipoMantenimientoEvent() {
      this.tipoMantenimientoData.btnAprobar = true;
      this.tipoMantenimientoData.textField.push({
        idTipoMantenimiento: null,
      });
    },
    removeTipoMantenimientoEvent(index) {
      this.tipoMantenimientoData.textField.splice(index, 1);
      console.log(
        "removeTipoMantenimientoEvent > tipoMantenimientoData.textField: ",
        this.tipoMantenimientoData.textField
      );
      if (this.tipoMantenimientoData.textField.length === 0) {
        this.tipoMantenimientoData.btnAprobar = false;
      }
    },
    solicitudMantenimientoToggleEvent() {
      console.log(
        "solicitudMantenimientoToggleEvent: ",
        this.solicitudMantenimientoToggleModel
      );
      if (this.solicitudMantenimientoToggleModel == "Mantenimientos") {
        this.tableSolicitudHide = false;
      } else {
        this.tableSolicitudHide = true;
      }
    },
    customSort(items, index, isDesc) {
      items.sort((a, b) => {
        if (isDesc != "false") {
          return a[index] < b[index] ? -1 : 1;
        } else {
          return b[index] < a[index] ? -1 : 1;
        }
      });
      return items;
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
  
