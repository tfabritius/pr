import { Component, Vue } from 'vue-property-decorator'
import {
  mdiAccount,
  mdiCheck,
  mdiClose,
  mdiDelete,
  mdiLogoutVariant,
  mdiMenu,
  mdiMenuOpen,
  mdiPencil,
  mdiPlus,
  mdiTranslate,
} from '@mdi/js'

@Component
export class IconsMixin extends Vue {
  mdiAccount = mdiAccount
  mdiCheck = mdiCheck
  mdiClose = mdiClose
  mdiDelete = mdiDelete
  mdiLogoutVariant = mdiLogoutVariant
  mdiMenu = mdiMenu
  mdiMenuOpen = mdiMenuOpen
  mdiPencil = mdiPencil
  mdiPlus = mdiPlus
  mdiTranslate = mdiTranslate
}
