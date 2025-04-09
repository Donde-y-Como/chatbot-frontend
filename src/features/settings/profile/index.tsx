import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile() {
  return (
    <ContentSection
      title='Perfil'
      desc='Perzonaliza tu perfil.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
