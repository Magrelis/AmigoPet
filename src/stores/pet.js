// src/stores/pet.js
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
      if (!this.selectedPet && pets.length > 0) {
        this.setSelectedPet(pets[0])
      }
    },

    addPetCare(petId, careData) {
      const pet = this.pets.find(p => p.id === petId)
      if (pet) {
        if (!pet.cares) pet.cares = []

        const newCare = {
          id: Date.now(),
          ...careData
        }

        pet.cares.push(newCare)
        return newCare
      }
    },

    clear() {
      this.selectedPet = null
      this.pets = []
      LocalStorage.remove('@amigopet-selected-pet')
    }
  }
})
