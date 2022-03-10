<template>
  <div class="NotFound">
    <v-container>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card height="400" color="transparent" flat>
            <div class="display-3 mt-5">Page no encontrada.</div>
            <div class="grey--text lighten-5">
              La página a la que intenta acceder nunca existió en esta realidad
              o ha migrado a un universo paralelo.
            </div>
            <div class="paragraph-text mt-2">
              <br />
              <br />Intente volver a la página de inicio y repetir su acción. O
              comuníquese con el servicio de asistencia técnica para obtener
              asistencia.
            </div>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "PageNotFoundView",
};
</script>
<style>
.paragraph-text {
  font-size: 18px;
}
</style>