<template>
  <v-app id="inspire">
    <v-alert
      :value="alertError"
      transition="slide-y-transition"
      type="warning"
      elevation="10"
      width="100%"
      >{{ alertMessage }}</v-alert
    >
    <v-row class="fill-height">
      <v-col cols="2">
        <v-card class="mx-left" height="100%" flat>
          <v-navigation-drawer class="blue lighten-5 accent-4" dark permanent>
            <v-list>
              <!-- USUARIOS -->
              <v-list-item
                v-if="usuarioRol.nombreRol === 'admin'"
                link
                @click="changePanelItem('Usuarios')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-key-variant </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>Usuarios</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <!-- UV -->
              <v-list-item
                v-if="usuarioRol.nombreRol === 'admin'"
                link
                @click="changePanelItem('Uvs')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-home-variant</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>U. Vecinales</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <!-- UNIDAD EDUCATIVA -->
              <v-list-item link @click="changePanelItem('Unidad Educativa')">
                <v-list-item-icon>
                  <v-icon>mdi-home </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>U. Educativa</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <!-- TIPO MANTENIMIENTO -->
              <v-list-item link @click="changePanelItem('Tipo Mantenimiento')">
                <v-list-item-icon>
                  <v-icon>mdi-wrench-clock </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>Tipo Mantenimiento</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <!-- SOLICITUD -->
            <v-list-item link @click="changePanelItem('Solicitud')">
              <v-list-item-icon>
                <v-icon>mdi-account-box-multiple</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Solicitudes</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- REPORTES -->
            <v-list-item link @click="changePanelItem('Reportes')">
              <v-list-item-icon>
                <v-icon>mdi-wrench </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Reportes</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <template v-slot:append>
              <div class="pa-2">
                <v-btn @click="cerraSesionEvent" block color="error">
                  Cerrar Sesión
                </v-btn>
              </div>
            </template>
          </v-navigation-drawer>
        </v-card>
      </v-col>
      <v-col cols="9" class="text-center">
        <UsuarioComponent
          :model="selectedPanelItem"
          :usuarioRol="usuarioRol.nombreRol"
          v-if="selectedPanelItem === 'Usuarios'"
        />
        <UvComponent
          :model-data="selectedPanelItem"
          :usuarioRol="usuarioRol.nombreRol"
          v-if="selectedPanelItem === 'Uvs'"
        />
        <UEducativaComponent
          :model-data="selectedPanelItem"
          :usuarioRol="usuarioRol.nombreRol"
          v-if="selectedPanelItem === 'Unidad Educativa'"
        />
        <TipoMantenimientoComponent
          :model-data="selectedPanelItem"
          :usuarioRol="usuarioRol.nombreRol"
          v-if="selectedPanelItem === 'Tipo Mantenimiento'"
        />
        <SolicitudComponent
          :model-data="selectedPanelItem"
          :usuarioRol="usuarioRol.nombreRol"
          v-if="selectedPanelItem === 'Solicitud'"
        />
        <ReporteComponent
          :model-data="selectedPanelItem"
          :usuarioRol="usuarioRol.nombreRol"
          v-if="selectedPanelItem === 'Reportes'"
        />
      </v-col>
    </v-row>
  </v-app>
</template>
<script>
import UsuarioComponent from "../components/UsuarioComponent.vue";
import UvComponent from "../components/UvComponent.vue";
import TipoMantenimientoComponent from "../components/TipoMantenimientoComponent.vue";
import UEducativaComponent from "../components/UEducativaComponent.vue";
import SolicitudComponent from "../components/SolicitudComponent.vue";
import ReporteComponent from "../components/ReporteComponent.vue";
import utilities from "../utility/utilities";
import axios from "axios";

export default {
  name: "PanelAdministrativoView",
  components: {
    UsuarioComponent,
    UvComponent,
    TipoMantenimientoComponent,
    UEducativaComponent,
    SolicitudComponent,
    ReporteComponent,
  },

  data: () => ({
    //alert variables
    alertError: false,
    alertMessage: "",
    selectedPanelItem: "",
    usuarioRol: {},
  }),
  created() {
    //no mostrar users a no ser que el rol sea admin
    //verificar si es token valido
    this.usuarioRol = utilities.verifyRol();
  },
  watch: {
    alertError(new_val) {
      if (new_val) {
        setTimeout(() => {
          this.alertError = false;
        }, 2000);
      }
    },
  },
  methods: {
    changePanelItem(panelItem) {
      this.selectedPanelItem = panelItem;
      console.log(
        "PanelAdministrativoView > changePanelItem > selectedPanelItem: ",
        this.selectedPanelItem
      );
    },
    async cerraSesionEvent() {
      console.log("[>] PanelAdministrativoView, cerraSesionEvent: ");
      const { data } = await axios.get(
        "https://api-defensa-externa.herokuapp.com/api/autorizacion/cerrarsesion"
      );
      this.alertError = true;
      this.alertMessage = data.msg;
      setTimeout(() => {
        if (data.ok) {
          localStorage.token = data.token;
        }
        this.$router.push({ name: "IniciarSesionView" });
      }, 1500);
    },
  },
};
</script>

<style >
/* .v-alert {
  position: fixed;
  left: 50%;
  bottom: 50px;
  transform: translate(-50%, -50%);
  margin: 0 auto;
} */
</style>>