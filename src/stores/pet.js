import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const usePetStore = defineStore('pet', {
  state: () => ({
    selectedPet: LocalStorage.getItem('@amigopet-selected-pet') || null,
    pets: [],
  }),
  actions: {
    setSelectedPet(pet) {
      this.selectedPet = pet
      LocalStorage.set('@amigopet-selected-pet', pet)
    },
    setPets(pets) {
      this.pets = pets
      if (!this.selectedPet && pets.length > 0) this.setSelectedPet(pets[0])
    },
    clear() {
      this.selectedPet = null
      this.pets = []
      LocalStorage.remove('@amigopet-selected-pet')
    },
  },
})
