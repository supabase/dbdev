import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import H1 from '~/components/ui/typography/H1'
import { useUsersOrganizationsQuery } from '~/data/organizations/users-organizations-query'
import { useProfileQuery } from '~/data/profiles/profile-query'
import { useUpdateProfileMutation } from '~/data/profiles/update-profile-mutation'
import { useAuth, useUser, withAuth } from '~/lib/auth'
import supabase from '~/lib/supabase'
import { NextPageWithLayout } from '~/lib/types'
import { useParams } from '~/lib/utils'
import { UpdateProfileSchema } from '~/lib/validations'

const EditAccountPage: NextPageWithLayout = () => {
  const user = useUser()
  const router = useRouter()
  const { handle } = useParams()
  const uploadButtonRef = useRef<any>()
  const { refreshSession } = useAuth()
  const {
    data: profile,
    isLoading,
    isSuccess: isProfileSuccess,
  } = useProfileQuery({ handle })
  const { data: organizations, isSuccess: isOrgsSuccess } =
    useUsersOrganizationsQuery({ userId: user?.id })

  const [uploadedFile, setUploadedFile] = useState<File>()
  const [previewImage, setPreviewImage] = useState<any>('')

  const { mutateAsync: updateProfile } = useUpdateProfileMutation({
    onSuccess() {
      toast.success('Successfully updated profile!')
      router.replace(`/${handle}`)
    },
  })

  const isUser = user?.id === profile?.id
  const isMember =
    organizations?.find((org) => org.handle === handle) !== undefined
  const preventUpdating = !isUser && !isMember

  const initialValues = {
    bio: profile?.bio ?? '',
    handle: profile?.handle ?? '',
    displayName: profile?.display_name ?? '',
  }

  useEffect(() => {
    if (isProfileSuccess && isOrgsSuccess) {
      if (preventUpdating) {
        toast.error('Unable to edit profile')
        router.push(`/${handle}`)
      } else {
        setPreviewImage(profile.avatar_url)
      }
    }
  }, [isProfileSuccess, isOrgsSuccess, preventUpdating])

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const reader = new FileReader()
    reader.addEventListener('load', () => setPreviewImage(reader.result))
    if (file) {
      setUploadedFile(file)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async ({
    displayName,
    bio,
  }: {
    displayName: string
    bio: string
  }) => {
    if (!profile?.handle) return console.error('A profile handle is required')

    try {
      if (uploadedFile) {
        const extension = uploadedFile.name.split('.').pop()
        const nowStr = new Date().getTime().toString()
        const path = `${handle}/avatar-${nowStr}.${extension}`
        const { error } = await supabase.storage
          .from('avatars')
          .upload(path, uploadedFile, { cacheControl: `${60 * 60 * 24 * 365}` })
        if (error) {
          console.log('Error uploading file: ', error.message)
        }
      }
      await refreshSession()
      await updateProfile({ handle: profile?.handle, displayName, bio })
    } catch (error: any) {
      return {
        [FORM_ERROR]:
          'Sorry, we had an unexpected error. Please try again. - ' +
          error.toString(),
      }
    }
  }

  return (
    <>
      <Head>
        <title>
          {`${
            profile ? `${profile.display_name} | ` : ''
          }The Database Package Manager`}
        </title>
      </Head>
      {isLoading ? (
        <p>Loading</p>
      ) : (
        <div className="w-full max-w-lg mx-auto space-y-8">
          <H1 className="!text-3xl">Edit {profile?.type ?? ''}</H1>
          <Form
            initialValues={initialValues}
            onSubmit={onSubmit}
            schema={UpdateProfileSchema}
          >
            <p className="text-sm font-medium dark:text-white">
              Profile picture
            </p>
            <div className="flex items-center mb-4 space-x-8">
              <div
                className="w-24 h-24 bg-center bg-no-repeat bg-cover border rounded-full dark:border-slate-700"
                style={{
                  backgroundImage: `url('${previewImage}')`,
                }}
              />
              <input
                ref={uploadButtonRef}
                type="file"
                onChange={uploadAvatar}
                className="hidden"
                accept="image/jpeg, image/png"
              />
              <button
                type="button"
                className="flex items-center px-4 py-2 space-x-2 text-sm text-gray-600 border-gray-300 transition bg-white border rounded-md dark:bg-transparent dark:border-slate-500 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-slate-400 hover:text-gray-800 hover:border-gray-400"
                onClick={() => uploadButtonRef?.current?.click()}
                disabled={preventUpdating}
              >
                Select an image
              </button>
            </div>
            <div className="space-y-4">
              <FormInput disabled name="handle" label="Handle" type="text" />
              <FormInput name="displayName" label="Display name" type="text" />
              <FormInput
                name="bio"
                label="Biography"
                type="text"
                placeholder="Tell us more about yourself"
              />
            </div>

            <FormButton disabled={preventUpdating}>Save changes</FormButton>
          </Form>
        </div>
      )}
    </>
  )
}

EditAccountPage.getLayout = (page) => <Layout>{page}</Layout>

export default withAuth(EditAccountPage)
