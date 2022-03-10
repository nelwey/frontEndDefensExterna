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

    <!-- TABLA MANTENIMIENTO -->

    <v-data-table
      v-if="mantenimientoData.showMantenimientoTable"
      :loading="loading"
      loading-text="Cargando..."
      :headers="headersMantenimiento"
      :items="mantenimientoData.mantenimientos"
      :search="searchMantenimientos"
      item-key="_id"
      :footer-props="{
        'items-per-page-options': [15, 20, 30, 40, 50],
      }"
      class="elevation-1 pa-5"
      :items-per-page="15"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Mantenimientos</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="searchMantenimientos"
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
            @click="mantenimientoData.showMantenimientoTable = false"
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
        <v-icon v-if="item.estado == 'proceso'" small class="mr-2" @click="openDialogActualizar(item)">
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
          v-if="item.estado == 'proceso'"
          color="primary"
          dark
          x-small
          class="mb-2"
          @click="openDialogGastos(item)"
        >
          Agregar gastos
        </v-btn>
        <v-btn
          v-if="item.estado == 'finalizado'"
          color="secondary"
          dark
          x-small
          class="mb-2"
          @click="openDialogInfoGastos(item)"
        >
          Ver gastos
        </v-btn>
      </template>
    </v-data-table>

    <!-- TABLA SOLICITUDES -->
    <v-data-table
      v-if="!mantenimientoData.showMantenimientoTable"
      :loading="loading"
      loading-text="Cargando..."
      :headers="headersSolicitud"
      :items="solicitudData.solicitudes"
      :search="searchSolicitudes"
      item-key="_id"
      :footer-props="{
        'items-per-page-options': [15, 20, 30, 40, 50],
      }"
      class="elevation-1 pa-5"
      :items-per-page="15"
    >
      <template v-slot:top>
        <v-container>
          <v-row>
            <v-col cols="4">
              <v-btn
                color="secondary"
                dark
                @click="mantenimientoData.showMantenimientoTable = true"
              >
                Volver
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-toolbar flat>
                <v-toolbar-title>Solicitudes</v-toolbar-title>
              </v-toolbar>
            </v-col>
            <v-col cols="4">
              <v-toolbar flat>
                <v-text-field
                  v-model="searchSolicitudes"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-toolbar>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          v-if="item.estado === 'aprobada'"
          @click="AddMantenimientoEvent(item)"
          x-small
          color="primary"
          dark
        >
          <v-icon small> mdi-wrench </v-icon>
          Agregar Mantenimientos
        </v-btn>
      </template>
    </v-data-table>
    <!-- AGREGAR MANTENIMIENTO MODAL -->
    <v-dialog v-model="isAddMantenimientoModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Agregar Mantenimientos</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <div
                    v-for="(textField, i) in tipoMantenimientoData.textField"
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
                          :items="tipoMantenimientoData.tipoMantenimientos"
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
                  <v-btn @click="addTipoMantenimientoEvent" class="primary"
                    >Agregar Mantenimiento</v-btn
                  >
                </v-col>
                <v-col cols="6">
                  <v-btn
                    @click="guardarMantenimientos"
                    class="success"
                    v-if="tipoMantenimientoData.btnAprobar"
                    >Guardar</v-btn
                  >
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- AGREGAR GASTOS MODAL -->
    <v-dialog v-model="isGastoModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Agregar Gasto</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <div v-for="(gasto, i) in gastoData.gastos" :key="i">
                    <v-row>
                      <v-col cols="7">
                        <v-textarea
                          autocomplete="Detalle"
                          label="detalle"
                          v-model="gasto.detalle"
                          no-resize
                          rows="1"
                        >
                        </v-textarea>
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model="gasto.costo"
                          label="Costo"
                          type="number"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="1">
                        <v-btn
                          class="mx-2"
                          small
                          fab
                          dark
                          color="error"
                          @click="removeGastoEvent(i)"
                        >
                          <v-icon dark> mdi-minus </v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>
                </v-col>
                <v-col cols="6">
                  <v-btn @click="addGastoEvent()" class="primary"
                    >Agregar gasto</v-btn
                  >
                </v-col>
                <v-col cols="6">
                  <v-btn
                    @click="guardarGastos"
                    class="success"
                    v-if="gastoData.btnGuardarGasto"
                    >Guardar</v-btn
                  >
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- VER GASTOS MODAL -->
    <v-dialog v-model="isGastoInfoModalOpen" max-width="800px">
      <v-card>
        <v-card-text>
          <v-container>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-list dense disabled>
                    <v-subheader>LISTA DE GASTOS</v-subheader>
                    <v-list-item-group>
                      <v-list-item
                        v-for="(gasto, i) in mantenimientoData
                          .selectedMantenimiento.gastos"
                        :key="i"
                      >
                        <v-list-item-icon>
                          <v-icon small color="secondary">mdi-cash</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title
                            v-text="
                              `${gasto._id} - ${gasto.detalle} - ${gasto.costo} `
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

    <!-- ACTUALIZAR MODAL -->
    <v-dialog v-model="isActualizarModalOpen" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Actualizar Mantenimiento</span>
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
                    v-model="mantenimientoData.selectedMantenimiento.estado"
                    :items="mantenimientoData.mantenimientoEstados"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-select
                    item-value="_id"
                    item-text="nombre"
                    label="Tipo Mantenimiento"
                    hint="Tipo Mantenimiento"
                    persistent-hint
                    v-model="mantenimientoData.selectedMantenimiento.idTipoMantenimiento"
                    :items="tipoMantenimientoData.tipoMantenimientos"
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
                  @click="actualizarMantenimiento"
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
    <!-- <v-dialog v-model="isEliminarModalOpen" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Eliminar Unidad Educativa</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="EliminarForm" v-model="isEliminarFormValid">
              <v-row>
                Esta seguro que quiere eliminar la unidad educativa
                {{ mantenimientoData.selectedUeducativa.nombre }}?
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
    </v-dialog> -->
  </v-app>
</template>
<script>
import axios from "axios";
import utilities from "../utility/utilities";
export default {
  name: "MantenimientoComponent",
  data: () => ({
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

    //variables tipo Mantenimiento
    gastoData: {
      gastos: [],
      btnGuardarGasto: false,
    },
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

    // variables mantenimiento data
    mantenimientoData: {
      fechaInicio: "",
      fechaFin: "",
      estado: "",
      gastos: [],
      showMantenimientoTable: true,
      mantenimientos: [],
      mantenimientoEstados: ["proceso", "finalizado"],
      selectedMantenimiento: {
        _id: "",
        idSolicitud: {
          _id: "",
        },
        idTipoMantenimiento: {
          _id: "",
          nombre: "",
        },
        fechaInicio: "",
        fechaFin: "",
        estado: "",
        gastos: [],
      },
      idSolicitud: {
        _id: "",
      },
      idTipoMantenimiento: {
        _id: "",
        nombre: "",
      },
    },

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
      },

      solicitudes: [],
    },

    //variables formulario
    isNuevoModalOpen: false,
    isNuevoFormValid: true,

    isActualizarModalOpen: false,
    isActualizarFormValid: true,

    isEliminarModalOpen: false,
    isEliminarFormValid: true,

    isAddMantenimientoModalOpen: false,

    isGastoModalOpen: false,
    isGastoInfoModalOpen: false,

    show1: false,

    // table data
    loading: false,
    headersMantenimiento: [
      {
        text: "ID Solicitud",
        value: "idSolicitud._id",
        align: "left",
      },
      { text: "Unidad Educativa", value: "idSolicitud.idUEducativa.nombre" },
      { text: "Tipo", value: "idTipoMantenimiento.nombre" },
      { text: "FechaInicio", value: "fechaInicio" },
      { text: "Estado", value: "estado" },
      { text: "Acciones", value: "actions", sortable: false },
    ],
    headersSolicitud: [
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
    searchMantenimientos: "",
    searchSolicitudes: "",

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
    this.obtenerMantenimientos();
    this.obtenerSolicitudes();
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
    async guardarGastos() {
      console.log("guardarGastos > gastos: ", this.gastoData.gastos);
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/mantenimiento/${this.mantenimientoData.selectedMantenimiento._id}`,
          {
            idSolicitud:
              this.mantenimientoData.selectedMantenimiento.idSolicitud,
            idTipoMantenimiento:
              this.mantenimientoData.selectedMantenimiento.idTipoMantenimiento
                ._id,
            fechaInicio:
              this.mantenimientoData.selectedMantenimiento.fechaInicio,
            fechaFin: "",
            estado: "proceso",
            gastos: this.gastoData.gastos,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("MantenimientoComponent > guardarGastos: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isGastoModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerMantenimientos();
        }
      } catch (error) {
        console.log("MantenimientoComponent > guardarGastos > error: ", error);
        setTimeout(() => {
          this.isGastoModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    async actualizarMantenimiento() {
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/mantenimiento/${this.mantenimientoData.selectedMantenimiento._id}`,
          {
            idSolicitud:
              this.mantenimientoData.selectedMantenimiento.idSolicitud,
            idTipoMantenimiento:
              this.mantenimientoData.selectedMantenimiento.idTipoMantenimiento
                ._id,
            fechaInicio:
              this.mantenimientoData.selectedMantenimiento.fechaInicio,
            fechaFin: new Date(),
            estado: this.mantenimientoData.selectedMantenimiento.estado,
            gastos: this.mantenimientoData.selectedMantenimiento.gastos,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("MantenimientoComponent > actualizarMantenimiento: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isActualizarModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
          this.obtenerMantenimientos();
        }
      } catch (error) {
        console.log("MantenimientoComponent > guardarGastos > error: ", error);
        setTimeout(() => {
          this.isActualizarModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
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
        console.log("MantenimientoComponent > obtenerSolicitudes: ", data);
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
    async obtenerMantenimientos() {
      try {
        const { data } = await axios.get(
          "https://api-defensa-externa.herokuapp.com/api/mantenimientos",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("MantenimientoComponent > obtenerMantenimientos: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            // var FilteredMantenimientos = data.mantenimientos.filter(
            //   (x) => x.estado == "proceso"
            // );
            this.mantenimientoData.mantenimientos = data.mantenimientos;
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
        console.log("MantenimientoComponent > obtenerSolicitudById: ", data);
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
    async obtenerMantenimientoById(id) {
      try {
        const { data } = await axios.get(
          `https://api-defensa-externa.herokuapp.com/api/mantenimiento/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log(
          "MantenimientoComponent > obtenerMantenimientoById: ",
          data
        );
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.mantenimientoData.selectedMantenimiento = data.mantenimiento;
            this.gastoData.gastos =
              this.mantenimientoData.selectedMantenimiento.gastos;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async guardarMantenimientos() {
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
                gastos: this.mantenimientoData.gastos,
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
                console.log("Mantenimiento creado > data: ", result);
                this.isAddMantenimientoModalOpen = false;
                this.mantenimientoData.showMantenimientoTable = true;
                this.obtenerMantenimientos();
              } else {
                console.log("Sth went wrong: ", result);
              }
            });
        });
      } catch (error) {
        console.log(
          "MantenimientoComponent > guardarMantenimientos > error: ",
          error
        );
        setTimeout(() => {
          this.isNuevoModalOpen = false;
        }, 500);
        let mensaje = error.response.data.msg;
        this.alertError = true;
        this.alertMessage = mensaje;
      }
    },
    async actualizarSolicitud() {
      console.log("solicitudData: ", this.solicitudData.selectedSolicitud);
      try {
        const { data } = await axios.put(
          `https://api-defensa-externa.herokuapp.com/api/solicitud/${this.solicitudData.selectedSolicitud._id}`,
          {
            idUEducativa: this.solicitudData.selectedSolicitud.idUEducativa,
            fecha: this.solicitudData.selectedSolicitud.fecha,
            descripcion: this.solicitudData.selectedSolicitud.descripcion,
            estado: "archivada",
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("MantenimientoComponent > actualizarSolicitud: ", data);
        if (data.ok) {
          setTimeout(() => {
            this.isAddMantenimientoModalOpen = false;
          }, 500);
          this.alertMessage = data.msg;
          this.alertSucces = true;
        }
      } catch (error) {
        console.log(
          "MantenimientoComponent > actualizarSolicitud > error: ",
          error
        );
        setTimeout(() => {
          this.isAddMantenimientoModalOpen = false;
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
    openDialogActualizar(mantenimiento) {
      this.obtenerMantenimientoById(mantenimiento._id);
      this.isActualizarModalOpen = true;
    },
    openDialogEliminar(ueducativa) {
      this.mantenimientoData.selectedUeducativa = Object.assign({}, ueducativa);
      this.isEliminarModalOpen = true;
    },
    openDialogGastos(mantenimiento) {
      this.obtenerMantenimientoById(mantenimiento._id);
      this.isGastoModalOpen = true;
    },
    openDialogInfoGastos(mantenimiento) {
      this.obtenerMantenimientoById(mantenimiento._id);
      this.isGastoInfoModalOpen = true;
    },
    toPDF() {
      const arreglo = [
        { title: "ID", dataKey: "_id" },
        {
          title: "TIPO",
          dataKey: "idTipoMantenimiento",
          displayProperty: "nombre",
        },
        { title: "FECHA INICIO", dataKey: "fechaInicio" },
        { title: "ESTADO", dataKey: "estado" },
      ];
      utilities.generatePDF(
        "Listado de Mantenimientos",
        arreglo,
        this.mantenimientoData.mantenimientos,
        ""
      );
    },
    addTipoMantenimientoEvent() {
      this.tipoMantenimientoData.btnAprobar = true;
      this.tipoMantenimientoData.textField.push({
        idTipoMantenimiento: null,
      });
    },
    addGastoEvent() {
      this.gastoData.btnGuardarGasto = true;
      this.gastoData.gastos.push({
        detalle: "",
        costo: null,
      });
      console.log("addGastoEvent > gastoData: ", this.gastoData.gastos);
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
    removeGastoEvent(index) {
      this.gastoData.gastos.splice(index, 1);

      if (this.gastoData.gastos.length === 0) {
        this.gastoData.btnGuardarGasto = false;
      }
    },
    AddMantenimientoEvent(solicitud) {
      this.obtenerSolicitudById(solicitud._id);
      console.log("AddMantenimientoEvent > item: ", solicitud);
      this.isAddMantenimientoModalOpen = true;
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
  
