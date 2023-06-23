import Head from 'next/head'
import { DropzoneS3Upload } from '~/components/Upload_S3'

// import { Montserrat, Inter, Rubik_Puddles, Audiowide } from "next/font/google"
import { Montserrat } from 'next/font/google'

import {
  // Card,
  // Image,
  Text,
  Title,
  // Badge,
  // MantineProvider,
  // Button,
  // Group,
  // Stack,
  // createStyles,
  // FileInput,
  Flex,
  Group,
  Checkbox,
  CheckboxProps,
  // rem,
} from '@mantine/core'

// const rubik_puddles = Rubik_Puddles({
//   weight: '400',
//   subsets: ['latin'],
// });

const montserrat = Montserrat({
  weight: '700',
  subsets: ['latin'],
})

import Link from 'next/link'
import React, { useState } from 'react'
import GlobalHeader from './GlobalHeader'
import EmailChipsComponent from './EmailChipsComponent'
import { IconLock } from '@tabler/icons-react'
import { useUser } from '@clerk/nextjs'
import { CourseMetadata } from '~/types/courseMetadata'
import { GetCurrentPageName } from './MakeOldCoursePage'

const MakeNewCoursePage = ({ course_name }: { course_name: string }) => {
  const { isSignedIn, user } = useUser()
  console.log('email: ', user?.primaryEmailAddress?.emailAddress)
  const owner_email = user?.primaryEmailAddress?.emailAddress as string

  return (
    <>
      <Head>
        <title>{course_name}</title>
        <meta
          name="description"
          content="The AI teaching assistant built for students at UIUC."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GlobalHeader />

      <main className="items-left justify-left; course-page-main flex min-h-screen flex-col">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-5 ">
          <Link href="/">
            <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              UIUC Course{' '}
              <span className="${inter.style.fontFamily} text-[hsl(280,100%,70%)]">
                AI
              </span>
            </h2>
          </Link>
        </div>
        <div className="items-left container flex flex-col justify-center gap-12 px-20 py-16 ">
          <h5 className="xs:text-[5rem] text-5xl font-extrabold tracking-tight text-white">
            <Text
              className={montserrat.className}
              variant="gradient"
              gradient={{ from: 'gold', to: 'white', deg: 20 }}
            >
              {course_name}
            </Text>
            is available, create an AI assistant.
          </h5>

          <Flex direction="column" align="center" justify="center">
            <Title style={{ color: 'White' }} order={3} p="md">
              Just one step: upload your textbooks, lecture slides, video
              recordings and any other files.
            </Title>
            <Title style={{ color: 'White' }} order={3} variant="normal">
              Claim your URL:
            </Title>
            <Title
              style={{ color: 'White' }}
              order={2}
              p="md"
              variant="gradient"
              weight="bold"
              gradient={{ from: 'gold', to: 'white', deg: 140 }}
            >
              {course_name}
            </Title>

            {/* !! MAIN UPLOAD COMPONENT !! */}
            <DropzoneS3Upload course_name={course_name} />

            <Title order={4}>
              Stay on page until loading is complete or ingest will fail.
            </Title>
            <Title order={4}>
              The page will auto-refresh when your AI Assistant is ready.
            </Title>

            <PrivateOrPublicCourse course_name={course_name} />
          </Flex>
        </div>
      </main>
    </>
  )
}

const PrivateOrPublicCourse = ({ course_name }: { course_name: string }) => {
  const [isPrivate, setIsPrivate] = useState(false)

  const { isSignedIn, user } = useUser()
  console.log('email: ', user?.primaryEmailAddress?.emailAddress)
  const owner_email = user?.primaryEmailAddress?.emailAddress as string

  const CheckboxIcon: CheckboxProps['icon'] = ({ indeterminate, className }) =>
    indeterminate ? (
      <IconLock className={className} />
    ) : (
      <IconLock className={className} />
    )

  const handleCheckboxChange = () => {
    const callSetCoursePublicOrPrivate = async (
      course_name: string,
      is_private: boolean,
    ) => {
      try {
        const url = new URL(
          '/api/UIUC-api/setCoursePublicOrPrivate',
          window.location.origin,
        )
        url.searchParams.append('course_name', course_name)
        url.searchParams.append('is_private', String(is_private))

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        return data.success
      } catch (error) {
        console.error(
          'Error changing course from public to private (or vice versa):',
          error,
        )
        return false
      }
    }

    setIsPrivate(!isPrivate) // gui
    callSetCoursePublicOrPrivate(course_name, !isPrivate) // db
  }

  const callSetCourseMetadata = async (
    courseMetadata: CourseMetadata,
    course_name: string,
  ) => {
    try {
      const { is_private, course_owner, course_admins, approved_emails_list } =
        courseMetadata
      // const course_name = course_name

      console.log(
        'IN callSetCourseMetadata in MakeNewCoursePage: ',
        courseMetadata,
      )

      const url = new URL(
        '/api/UIUC-api/setCourseMetadata',
        window.location.origin,
      )
      url.searchParams.append('is_private', String(is_private))
      url.searchParams.append('course_name', course_name)
      url.searchParams.append('course_owner', course_owner)
      url.searchParams.append('course_admins', JSON.stringify(course_admins))
      url.searchParams.append(
        'approved_emails_list',
        JSON.stringify(approved_emails_list),
      )

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error setting course metadata:', error)
      return false
    }
  }

  const handleEmailAddressesChange = (
    new_course_metadata: CourseMetadata,
    course_name: string,
  ) => {
    console.log('Fresh course metadata:', new_course_metadata)
    // TODO: update db
    callSetCourseMetadata(
      {
        ...new_course_metadata,
      },
      course_name,
    )
  }

  return (
    <>
      <Title
        className={montserrat.className}
        variant="gradient"
        gradient={{ from: 'gold', to: 'white', deg: 50 }}
        order={2}
        p="xl"
        style={{ marginTop: '4rem' }}
      >
        {' '}
        Course Visibility{' '}
      </Title>
      <Group className="p-3">
        <Checkbox
          label={`Course is ${
            isPrivate ? 'private' : 'public'
          }. Click to change.`}
          // description="Course is private by default."
          aria-label="Checkbox to toggle Course being public or private. Private requires a list of allowed email addresses."
          className={montserrat.className}
          // style={{ marginTop: '4rem' }}
          size="xl"
          // bg='#020307'
          color="grape"
          icon={CheckboxIcon}
          defaultChecked={isPrivate}
          onChange={handleCheckboxChange}
        />
      </Group>
      {/* </Group>
      <Group className="p-3"> */}

      <Text>
        Only the below email address are able to access the content. Read our
        strict security policy (in progress).
      </Text>
      {isPrivate && (
        <EmailChipsComponent
          course_owner={owner_email}
          course_admins={[]} // TODO: add admin functionality
          course_name={course_name}
          onEmailAddressesChange={handleEmailAddressesChange}
        />
      )}
    </>
  )
}

export default MakeNewCoursePage
