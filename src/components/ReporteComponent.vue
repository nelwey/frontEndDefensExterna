<template>
  <v-app id="inspire">
    <v-container>
      <v-row>
        <v-col cols="6">
          <v-select
            v-model="reporteData.selectedReporte"
            :items="reporteData.reportes"
            hint="Seleccione Reporte"
            persistent-hint
            @input="toggleReportesEvent"
          ></v-select>
        </v-col>
      </v-row>
    </v-container>

    <!-- FILTRAR REPORTE 1 -->
    <v-container v-if="reporteData.reporteDisabled">
      <v-row>
        <v-col cols="3">
          <!-- tipo mantenimiento -->
          <v-select
            item-value="_id"
            item-text="nombre"
            v-model="tipoMantenimientoData.selectedtipoMantenimiento._id"
            :items="tipoMantenimientoData.tipoMantenimientos"
            label="Tipo Mantenimiento"
            hint="Seleccione Tipo Mantenimiento"
            persistent-hint
            @input="filtrarTipoMantenimientoEvent"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <!-- fechaFin -->
          <v-select
            v-model="fechaData.fechaSelected"
            :items="fechaData.fechas"
            label="Año"
            hint="Seleccione Año"
            persistent-hint
            :disabled="fechaData.disabled"
            @input="filtrarFechaEvent"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-btn
            color="primary"
            dark
            class="mb-2"
            @click="FiltrarMantenimientosPorTipo()"
            :disabled="btnFiltrar2.disabled"
          >
            Filtrar
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- FILTRAR REPORTE 2 -->
    <v-container v-if="!reporteData.reporteDisabled">
      <v-row>
        <v-col cols="3">
          <v-select
            item-value="_id"
            item-text="nombre"
            v-model="uvData.selectedUv._id"
            :items="uvData.uvs"
            label="UV"
            hint="Seleccione UV"
            persistent-hint
            @input="filtrarUVEvent"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-select
            item-value="_id"
            item-text="nombre"
            v-model="ueData.selectedUeducativa._id"
            :items="ueData.uEducativas"
            label="Unidad Educativa"
            hint="Seleccione Unidad Educativa"
            persistent-hint
            :disabled="ueData.disabled"
            @input="filtrarUEEvent"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-select
            item-value="_id"
            item-text="_id"
            v-model="solicitudData.selectedSolicitud._id"
            :items="solicitudData.solicitudes"
            label="Solicitud"
            hint="Seleccione Solicitud"
            persistent-hint
            :disabled="solicitudData.disabled"
            @input="filtrarSolicitudEvent"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-btn
            color="primary"
            dark
            class="mb-2"
            @click="FiltrarMantenimientos()"
            :disabled="btnFiltrar.disabled"
          >
            Filtrar
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- TABLA REPORTES 1 -->
    <v-data-table
      v-if="showReporteTable"
      :loading="loading"
      loading-text="Cargando..."
      :headers="headers"
      :items="mantenimientoData.mantenimientos"
      item-key="_id"
      :footer-props="{
        'items-per-page-options': [15, 20, 30, 40, 50],
      }"
      class="elevation-1 pa-5"
      :items-per-page="15"
    >
      <template v-slot:item.idTipoMantenimiento="{ item }">
        <tr>
          <td>{{ item.idTipoMantenimiento._id }}</td>
        </tr>
      </template>
      <template v-slot:item.fechaInicio="{ item }">
        <tr>
          <td>{{ item.fechaInicio }}</td>
        </tr>
      </template>
      <template v-slot:item.fechaFin="{ item }">
        <tr>
          <td>{{ item.fechaFin }}</td>
        </tr>
      </template>
      <template v-slot:item.estado="{ item }">
        <tr>
          <td>{{ item.estado }}</td>
        </tr>
      </template>
      <template v-slot:item.gastos="{ item }">
        <tr>
          <td>{{ getCostoTotal(item.gastos) }}</td>
        </tr>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Mantenimientos</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="secondary" dark class="mb-2" @click="toPDF">
            Generar PDF
          </v-btn>
        </v-toolbar>
      </template>
    </v-data-table>

    <!-- TABLA REPORTES 2 -->
    <v-data-table
      v-if="showReporteTable2"
      :loading="loading"
      loading-text="Cargando..."
      :headers="headers"
      :items="mantenimientoData.mantenimientos"
      item-key="_id"
      :footer-props="{
        'items-per-page-options': [15, 20, 30, 40, 50],
      }"
      class="elevation-1 pa-5"
      :items-per-page="15"
    >
      <template v-slot:item.idTipoMantenimiento="{ item }">
        <tr>
          <td>{{ item.idTipoMantenimiento._id }}</td>
        </tr>
      </template>
      <template v-slot:item.idUv="{ item }">
        <tr>
          <td>{{ item.idUv.nombre }}</td>
        </tr>
      </template>
      <template v-slot:item.idUEducativa="{ item }">
        <tr>
          <td>{{ item.idUEducativa.nombre }}</td>
        </tr>
      </template>
      <template v-slot:item.fechaInicio="{ item }">
        <tr>
          <td>{{ item.fechaInicio }}</td>
        </tr>
      </template>
      <template v-slot:item.fechaFin="{ item }">
        <tr>
          <td>{{ item.fechaFin }}</td>
        </tr>
      </template>
      <template v-slot:item.estado="{ item }">
        <tr>
          <td>{{ item.estado }}</td>
        </tr>
      </template>
      <template v-slot:item.gastos="{ item }">
        <tr>
          <td>{{ getCostoTotal(item.gastos) }}</td>
        </tr>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Mantenimientos</v-toolbar-title>
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
  </v-app>
</template>
<script>
import axios from "axios";
import utilities from "../utility/utilities";
export default {
  name: "ReporteComponent",
  data: () => ({
    // table data
    loading: false,
    headers: [
      { text: "ID", value: "idTipoMantenimiento._id" },
      { text: "Tipo Mantenimiento", value: "idTipoMantenimiento.nombre" },
      { text: "Fecha Inicio", value: "fechaInicio" },
      { text: "Fecha Fin", value: "fechaFin" },
      { text: "Estado", value: "estado" },
      { text: "Costo", value: "gastos" },
    ],
    headers2: [
      { text: "ID", value: "idTipoMantenimiento._id" },
      { text: "UV", value: "idUv.nombre" },
      { text: "Unidad Educativa", value: "idUEducativa.nombre" },
      { text: "Tipo Mantenimiento", value: "idTipoMantenimiento.nombre" },
      { text: "Fecha Inicio", value: "fechaInicio" },
      { text: "Fecha Fin", value: "fechaFin" },
      { text: "Estado", value: "estado" },
      { text: "Costo", value: "gastos" },
    ],

    showReporteTable: false,
    showReporteTable2: false,

    //variables fechaData
    fechaData: {
      fechas: ["2022", "2021", "2019"],
      fechaSelected: "",
      disabled: true,
    },

    //variables reporteData
    reporteData: {
      reportes: [
        "Reporte costos anuales de mantenimiento por tipo",
        "Reporte costos de mantenimientos por solicitud",
      ],
      reporteDisabled: true,
      selectedReporte: "Reporte costos anuales de mantenimiento por tipo",
    },

    btnFiltrar: {
      disabled: true,
    },
    btnFiltrar2: {
      disabled: true,
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

    //variables ue data
    ueData: {
      disabled: true,
      uEducativas: [],
      selectedUeducativa: {
        _id: "",
        nombre: "",
      },
    },

    // variables mantenimiento data
    mantenimientoData: {
      fechaInicio: "",
      fechaFin: "",
      estado: "",
      gastos: [],
      mantenimientos: [
        {
          fechaInicio: "",
          fechaFin: "",
          estado: "",
          gastos: [],
          idSolicitud: {
            _id: "",
          },
          idTipoMantenimiento: {
            _id: "",
            nombre: "",
          },
          idUEducativa: {
            _id: "",
            nombre: "",
            distrito: "",
          },
          idUv: {
            _id: "",
            nombre: "",
          },
          costoParcial: 0,
        },
      ],
      costoTotal: 0,
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
    // variables solicitud data
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
      disabled: true,

      solicitudes: [],
    },

    // variables tipo mantenimiento data
    tipoMantenimientoData: {
      nombre: "",
      selectedtipoMantenimiento: {
        _id: "",
        nombre: "",
      },

      tipoMantenimientos: [],
    },
  }),

  props: {
    model: {},
    usuarioRol: {
      type: String,
    },
  },
  created() {
    this.obtenerUvs();
    this.obtenertipoMantenimientos();
  },

  methods: {
    getCostoTotal(gastos) {
      var costoTotal = 0;
      gastos.forEach((gasto) => {
        costoTotal = costoTotal + gasto.costo;
      });
      return costoTotal;
    },
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
        console.log("ReporteComponent > obtenerUvs: ", data);
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
    async FiltrarMantenimientos() {
      this.mantenimientoData.costoTotal = 0;
      try {
        const { data } = await axios.post(
          `https://api-defensa-externa.herokuapp.com/api/reporte/mantenimiento`,
          {
            idSolicitud: this.solicitudData.selectedSolicitud._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("ReporteComponent > FiltrarMantenimientos: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.mantenimientoData.mantenimientos = data.mantenimientos;
            this.mantenimientoData.mantenimientos.forEach((mantenimiento) => {
              mantenimiento.idUv = this.uvData.selectedUv;
              mantenimiento.idUEducativa = this.ueData.selectedUeducativa;
              mantenimiento.costoParcial = this.getCostoTotal(
                mantenimiento.gastos
              );
            });
            console.log(
              "this.mantenimientoData.mantenimientos 1: ",
              this.mantenimientoData.mantenimientos
            );
            this.mantenimientoData.mantenimientos.forEach((x) => {
              this.mantenimientoData.costoTotal += x.costoParcial;
            });
            console.log(
              "this.mantenimientoData.mantenimientos 2: ",
              this.mantenimientoData
            );
            this.showReporteTable2 = true;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async obtenerSolicitudesByUE() {
      try {
        const { data } = await axios.post(
          `https://api-defensa-externa.herokuapp.com/api/solicitudesByUE`,
          {
            idUEducativa: this.ueData.selectedUeducativa._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("ReporteComponent > obtenerSolicitudesByUE: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            if (data.solicitudes.length > 0) {
              this.solicitudData.solicitudes = data.solicitudes;
              this.ueData.selectedUeducativa.nombre =
                data.solicitudes[0].idUEducativa.nombre;
            }
            this.loading = false;
          }, 500);
          this.solicitudData.disabled = false;
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
        console.log("ReporteComponent > obtenerUeducativaByUV: ", data);
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            if (data.uEducativas.length > 0) {
              this.ueData.uEducativas = data.uEducativas;
              this.uvData.selectedUv.nombre = data.uEducativas[0].idUv.nombre;
            }
            this.loading = false;
          }, 500);
          this.ueData.disabled = false;
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
          console.log("ReporteComponent > guardarUeducativa: ", data);
          if (data.ok) {
            setTimeout(() => {
              this.isNuevoModalOpen = !this.isNuevoModalOpen;
            }, 500);
            this.alertMessage = data.msg;
            this.alertSucces = true;
            this.obtenerUeducativas();
          }
        } catch (error) {
          console.log("ReporteComponent > guardarUeducativa > error: ", error);
          setTimeout(() => {
            this.isNuevoModalOpen = false;
          }, 500);
          let mensaje = error.response.data.msg;
          this.alertError = true;
          this.alertMessage = mensaje;
        }
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
        console.log("ReporteComponent > obtenertipoMantenimientos: ", data);
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
    async FiltrarMantenimientosPorTipo() {
      this.mantenimientoData.costoTotal = 0;
      try {
        const { data } = await axios.post(
          `https://api-defensa-externa.herokuapp.com/api/reporte/mantenimientoByTipo`,
          {
            idTipoMantenimiento:
              this.tipoMantenimientoData.selectedtipoMantenimiento._id,
            fechaFin: this.fechaData.fechaSelected,
            estado: "finalizado",
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        if (data.ok) {
          this.loading = true;
          setTimeout(() => {
            this.mantenimientoData.mantenimientos = data.mantenimientos;
            this.mantenimientoData.mantenimientos.forEach((mantenimiento) => {
              mantenimiento.idUv = this.uvData.selectedUv;
              mantenimiento.idUEducativa = this.ueData.selectedUeducativa;
              mantenimiento.costoParcial = this.getCostoTotal(
                mantenimiento.gastos
              );
            });
            console.log(
              "this.mantenimientoData.mantenimientos 1: ",
              this.mantenimientoData.mantenimientos
            );
            this.mantenimientoData.mantenimientos.forEach((x) => {
              this.mantenimientoData.costoTotal += x.costoParcial;
            });
            console.log(
              "this.mantenimientoData.mantenimientos 2: ",
              this.mantenimientoData
            );
            this.showReporteTable = true;
            this.loading = false;
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },
    filtrarUVEvent() {
      if (this.uvData.selectedUv._id === null) {
        this.ueData.disabled = true;
      } else {
        this.obtenerUeducativaByUV();
      }
    },
    filtrarUEEvent() {
      if (this.ueData.selectedUeducativa._id === null) {
        this.solicitudData.disabled = true;
      } else {
        this.obtenerSolicitudesByUE();
      }
    },
    filtrarSolicitudEvent() {
      if (this.solicitudData.selectedSolicitud._id === null) {
        this.btnFiltrar.disabled = true;
      } else {
        this.btnFiltrar.disabled = false;
      }
    },
    toPDF() {
      const arreglo = [
        {
          title: "ID SOLICITUD",
          dataKey: "idSolicitud",
          displayProperty: "_id",
        },
        {
          title: "TIPO MANTENIMIENTO",
          dataKey: "idTipoMantenimiento",
          displayProperty: "nombre",
        },
        { title: "FECHA INICIO", dataKey: "fechaInicio" },
        { title: "FECHA FIN", dataKey: "fechaFin" },
        { title: "ESTADO", dataKey: "estado" },
        { title: "COSTO", dataKey: "costoParcial" },
      ];
      const arreglo2 = [
        {
          title: "ID SOLICITUD",
          dataKey: "idSolicitud",
          displayProperty: "_id",
        },
        {
          title: "UNIDAD EDUCATIVA",
          dataKey: "idUEducativa",
          displayProperty: "nombre",
        },
        {
          title: "TIPO MANTENIMIENTO",
          dataKey: "idTipoMantenimiento",
          displayProperty: "nombre",
        },
        { title: "FECHA INICIO", dataKey: "fechaInicio" },
        { title: "FECHA FIN", dataKey: "fechaFin" },
        { title: "ESTADO", dataKey: "estado" },
        { title: "COSTO", dataKey: "costoParcial" },
      ];
      if (
        this.ueData.selectedUeducativa._id == null ||
        this.ueData.selectedUeducativa._id == ""
      ) {
        this.generatePDF(arreglo);
      } else {
        this.generatePDF(arreglo2);
      }
    },
    generatePDF(arreglo) {
      utilities.generatePDF(
        "Listado de Mantenimientos",
        arreglo,
        this.mantenimientoData.mantenimientos,
        `Costo Total: ${this.mantenimientoData.costoTotal}`
      );
    },
    toggleReportesEvent() {
      console.log("toggleReportesEvent");
      if (this.reporteData.selectedReporte == this.reporteData.reportes[1]) {
        this.mantenimientoData.costoTotal = 0;
        this.reporteData.reporteDisabled = false;
        this.showReporteTable = false;
      } else {
        this.mantenimientoData.costoTotal = 0;
        this.reporteData.reporteDisabled = true;
        this.showReporteTable2 = false;
        this.btnFiltrar.disabled = true;
        this.showReporteTable;
      }
    },
    filtrarTipoMantenimientoEvent() {
      console.log(
        "filtrarTipoMantenimientoEvent: ",
        this.tipoMantenimientoData.selectedtipoMantenimiento
      );
      if (this.tipoMantenimientoData.selectedtipoMantenimiento._id == null) {
        this.fechaData.disabled = true;
      } else {
        this.fechaData.disabled = false;
      }
    },
    filtrarFechaEvent() {
      if (this.fechaData.fechaSelected == null) {
        this.btnFiltrar2.disabled = true;
      } else {
        this.btnFiltrar2.disabled = false;
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
  
