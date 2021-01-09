import { Component, Vue } from 'vue-property-decorator'
import {
  mdiAccount,
  mdiApple,
  mdiCheck,
  mdiClose,
  mdiDelete,
  mdiInformation,
  mdiLinux,
  mdiLogoutVariant,
  mdiMenu,
  mdiMenuOpen,
  mdiMicrosoftWindows,
  mdiPencil,
  mdiPlaylistEdit,
  mdiPlus,
  mdiTranslate,
} from '@mdi/js'

@Component
export class IconsMixin extends Vue {
  mdiAccount = mdiAccount
  mdiApple = mdiApple
  mdiCheck = mdiCheck
  mdiClose = mdiClose
  mdiDelete = mdiDelete
  mdiInformation = mdiInformation
  mdiLinux = mdiLinux
  mdiLogoutVariant = mdiLogoutVariant
  mdiMenu = mdiMenu
  mdiMenuOpen = mdiMenuOpen
  mdiMicrosoftWindows = mdiMicrosoftWindows
  mdiPencil = mdiPencil
  mdiPlaylistEdit = mdiPlaylistEdit
  mdiPlus = mdiPlus
  mdiTranslate = mdiTranslate
}
