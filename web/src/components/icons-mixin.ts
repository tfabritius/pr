import { Component, Vue } from 'vue-property-decorator'
import {
  mdiAccount,
  mdiLogoutVariant,
  mdiMenu,
  mdiMenuOpen,
  mdiTranslate,
} from '@mdi/js'

@Component
export class IconsMixin extends Vue {
  mdiAccount = mdiAccount
  mdiLogoutVariant = mdiLogoutVariant
  mdiMenu = mdiMenu
  mdiMenuOpen = mdiMenuOpen
  mdiTranslate = mdiTranslate
}
