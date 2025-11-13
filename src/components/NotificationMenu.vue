<template>
  <q-btn round flat class="notification-btn">
    <q-icon name="notifications" size="24px" />
    <q-badge v-if="unreadCount > 0" color="red" floating rounded>2</q-badge>
  </q-btn>
</template>

<script>
export default {
  name: 'NotificationMenu',
  data() {
    return {}
  },
  computed: {},
  methods: {},
}
</script>
