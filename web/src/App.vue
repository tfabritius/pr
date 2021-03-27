<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon
        v-if="$store.getters.loggedIn"
        @click="toggleNavigationDrawer = !toggleNavigationDrawer"
      >
        <v-icon>{{
          !isDesktop || toggleNavigationDrawer ? mdiMenu : mdiMenuOpen
        }}</v-icon>
      </v-app-bar-nav-icon>

      <v-toolbar-title style="cursor: pointer">
        <router-link to="/" custom v-slot="{ navigate }">
          <span @click="navigate" @keypress.enter="navigate" role="link">
            Portfolio Report
          </span>
        </router-link>
      </v-toolbar-title>

      <v-spacer />

      <language-selector />

      <v-menu
        v-if="$store.getters.loggedIn"
        open-on-click
        offset-y
        transition="slide-y-transition"
      >
        <template #activator="{ on }">
          <v-btn text icon v-on="on">
            <v-icon>{{ mdiAccount }}</v-icon>
          </v-btn>
        </template>
        <v-list nav>
          <v-list-item link to="/profile">
            <v-list-item-icon>
              <v-icon>{{ mdiAccount }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t('common.profile') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link to="/sessions">
            <v-list-item-icon>
              <v-icon>{{ mdiAccountLock }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t('common.sessions') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="logout">
            <v-list-item-icon>
              <v-icon>{{ mdiLogoutVariant }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t('common.log-out') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer
      v-if="$store.getters.loggedIn"
      v-model="showNavigationDrawer"
      app
      mobile-breakpoint="0"
      :temporary="!isDesktop"
      :permament="isDesktop"
      :expand-on-hover="isDesktop && toggleNavigationDrawer"
      :mini-variant.sync="miniNavigationDrawer"
    >
      <v-list dense nav class="py-0">
        <v-menu>
          <template #activator="{ on }">
            <v-list-item two-line v-on="on">
              <v-list-item-content>
                <v-list-item-title>
                  <span v-if="$store.state.portfolio">
                    {{ $store.state.portfolio.name }}
                  </span>
                  <i v-else>{{ $t('common.select portfolio') }}</i>
                </v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>

          <PortfoliosList />
        </v-menu>

        <v-divider />

        <v-list-item
          v-for="nav in navigation"
          :key="nav.title"
          link
          :to="nav.to"
        >
          <v-list-item-icon>
            <v-icon>
              {{ nav.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ nav.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'
import LanguageSelector from '@/components/LanguageSelector.vue'
import PortfoliosList from '@/components/PortfoliosList.vue'

@Component({
  components: {
    LanguageSelector,
    PortfoliosList,
  },
})
export default class App extends Mixins(Vue, IconsMixin) {
  miniNavigationDrawer = false
  toggleNavigationDrawer = false

  get navigation(): Array<{
    icon: string
    title: string
    to: { path: string }
  }> {
    return [
      {
        icon: this.mdiViewDashboard,
        title: this.$tc('common.portfolio', 1),
        to: { path: '/' },
      },
      {
        icon: this.mdiBookMultiple,
        title: this.$tc('common.security', 2),
        to: { path: '/securities' },
      },
      {
        icon: this.mdiBank,
        title: this.$tc('common.securities account', 2),
        to: { path: '/securities-accounts' },
      },
      {
        icon: this.mdiCashMultiple,
        title: this.$tc('common.deposit account', 2),
        to: { path: '/deposit-accounts' },
      },
    ]
  }

  get isDesktop(): boolean {
    return this.$vuetify.breakpoint.mdAndUp
  }

  get showNavigationDrawer(): boolean {
    return this.isDesktop || this.toggleNavigationDrawer
  }

  set showNavigationDrawer(val: boolean) {
    this.toggleNavigationDrawer = val
  }

  async logout(): Promise<void> {
    this.$store.dispatch('logout')
  }
}
</script>

<style scoped>
.v-list-item:hover {
  background: var(--v-primary-base);
}
</style>
