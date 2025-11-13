<template>
  <q-page class="q-pa-md">
    <CareHistory :pet_id="pet?.id" @care-updated="onCareUpdated" />
    <CareAgenda ref="careAgenda" :pet_id="pet?.id" />
  </q-page>
</template>
<script>
import { mapStores } from 'pinia'
import { usePetStore } from 'src/stores/pet'
import { useUserStore } from 'src/stores/user'

import CareHistory from 'src/components/CareHistory.vue'
import CareAgenda from 'src/components/CareAgenda.vue'

export default {
  name: 'HomePage',
  components: {
    CareHistory,
    CareAgenda,
  },
  async mounted() {},
  data() {
    return {}
  },
  watch: {},
  computed: {
    ...mapStores(usePetStore, useUserStore),
    pet() {
      return this.petStore.selectedPet
    },
    user() {
      return this.userStore.user
    },
  },
  methods: {
    onCareUpdated() {
      if (this.$refs.careAgenda) {
        this.$refs.careAgenda.fetchCareHistory()
      }
    },
  },
}
</script>
