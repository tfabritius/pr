<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-btn color="primary" class="mb-4" @click="newSession">
        <v-icon>{{ mdiPlus }}</v-icon> {{ $t('common.new') }}
      </v-btn>

      <v-btn color="primary" class="mb-4 ml-4" @click="refresh">
        <v-icon>{{ mdiRefresh }}</v-icon> {{ $t('common.refresh') }}
      </v-btn>

      <v-data-table
        :items="sessions"
        :items-per-page="-1"
        :headers="[
          { text: $t('common.key'), value: 'token' },
          { text: $t('common.note'), value: 'note' },
          { text: $t('common.created'), value: 'createdAt' },
          { text: $t('common.latest activity'), value: 'lastActivityAt' },
          { value: 'actions' },
        ]"
        hide-default-footer
      >
        <template #item.token="{ item }">
          {{ item.token.substring(0, 6) }}...
        </template>
        <template #item.actions="{ item }">
          <v-btn color="error" icon text @click="confirmDeleteSession(item)">
            <v-icon>{{ mdiDelete }}</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-dialog v-model="sessionDialog" width="500">
        <v-form ref="form" @submit.prevent="saveSession">
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="selectedSession.note"
                :label="$t('common.note')"
                outlined
                dense
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text @click="sessionDialog = false">
                <v-icon>{{ mdiClose }}</v-icon> {{ $t('common.cancel') }}
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> {{ $t('common.save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-dialog v-model="tokenDialog" width="500">
        <v-form ref="form" @submit.prevent="tokenDialog = false">
          <v-card>
            <v-card-text>
              {{ $t('sessions.save-token-msg') }}
              <v-text-field
                v-model="selectedSession.token"
                outlined
                dense
                readonly
              >
              </v-text-field>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text type="submit">
                <v-icon>{{ mdiClose }}</v-icon> {{ $t('common.close') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-dialog v-model="deleteDialog" width="500">
        <v-form ref="form" @submit.prevent="deleteSession">
          <v-card>
            <v-card-text>
              {{
                $t('sessions.confirm-delete-msg', {
                  note: selectedSession.note,
                })
              }}
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text @click="deleteDialog = false">
                <v-icon>{{ mdiClose }}</v-icon> {{ $t('common.no') }}
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> {{ $t('common.yes') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-snackbar v-model="showSnackbar" timeout="5000" text color="error">
        {{ snackbarMessage }}
      </v-snackbar>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'
import gql from 'graphql-tag'

import { Session } from '@/store/session.model'
import { IconsMixin } from '@/components/icons-mixin'

const SessionsAll = gql`
  query {
    sessions {
      token
      note
      createdAt
      lastActivityAt
    }
  }
`

@Component({
  apollo: {
    sessions: SessionsAll,
  },
})
export default class SessionsPage extends Mixins(Vue, IconsMixin) {
  $refs!: {
    form: HTMLFormElement
  }

  sessions: Session[] = []
  showSnackbar = false
  snackbarMessage = ''

  sessionDialog = false
  deleteDialog = false
  tokenDialog = false
  selectedSession = {} as Session

  async refresh(): Promise<void> {
    this.$apollo.queries.sessions.refetch()
  }

  newSession(): void {
    this.selectedSession = {
      token: '',
      note: '',
      createdAt: '',
      lastActivityAt: '',
    }
    this.sessionDialog = true
    if (this.$refs.form) this.$refs.form.resetValidation()
  }

  editSession(session: Session): void {
    this.selectedSession = { ...session }
    this.sessionDialog = true
  }

  async saveSession(): Promise<void> {
    if (!this.$refs.form.validate()) {
      return
    }

    try {
      if (this.selectedSession.token) {
        await this.$store.dispatch('updatePortfolio', this.selectedSession)
      } else {
        const { data } = await this.$apollo.mutate({
          mutation: gql`
            mutation($note: String!) {
              createSession(note: $note) {
                token
                note
                createdAt
                lastActivityAt
              }
            }
          `,
          variables: { note: this.selectedSession.note },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          update: (cache: any, mutationResult: any) => {
            const data = cache.readQuery({ query: SessionsAll })
            data.sessions.push(mutationResult.data.createSession)
            cache.writeQuery({ query: SessionsAll, data })
          },
        })
        this.selectedSession = data.createSession
        this.tokenDialog = true
      }
    } catch (err) {
      this.snackbarMessage = err
      this.showSnackbar = true
    }
    this.sessionDialog = false
  }

  confirmDeleteSession(session: Session): void {
    this.selectedSession = session
    this.deleteDialog = true
  }

  async deleteSession(): Promise<void> {
    await this.$apollo.mutate({
      mutation: gql`
        mutation($token: String!) {
          deleteSession(token: $token) {
            token
          }
        }
      `,
      variables: { token: this.selectedSession.token },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: (cache: any, mutationResult: any) => {
        const data = cache.readQuery({ query: SessionsAll })
        const newSessions = data.sessions.filter(
          (s: Session) => s.token !== mutationResult.data.deleteSession.token,
        )
        cache.writeQuery({
          query: SessionsAll,
          data: { sessions: newSessions },
        })
      },
    })
    this.deleteDialog = false
  }
}
</script>
