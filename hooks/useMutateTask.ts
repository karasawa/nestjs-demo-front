import { useRouter } from 'next/router'
import axios from 'axios'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Task } from '@prisma/client'
import useStore from '../store'
import { EditedTask } from '../types'

export const useMutateTask = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const reset = useStore((state) => state.resetEditedTask)

  const createTaskMutation = useMutation(
    async (task: Omit<EditedTask, 'id'>) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/todo`,
        task
      )
      return res.data
    },
    {
      onSuccess: (res) => {
        const previosTodos = queryClient.getQueryData<Task[]>(['tasks'])
        if (previosTodos) {
          queryClient.setQueryData(['tasks'], [res, ...previosTodos])
        }
        reset()
      },
      onError: (error: any) => {
        if (error.response.status === 401 || error.response.status === 403)
          router.push('/')
      },
    }
  )
  const updateTaskMutation = useMutation(
    async (task: EditedTask) => {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/todo/${task.id}`,
        task
      )
      return res.data
    },
    {
      onSuccess: (res) => {
        const previosTodos = queryClient.getQueryData<Task[]>(['tasks'])
        if (previosTodos) {
          queryClient.setQueryData(
            ['tasks'],
            previosTodos.map((task) => (task.id === res.id ? res : task))
          )
        }
        reset()
      },
      onError: (error: any) => {
        if (error.response.status === 401 || error.response.status === 403)
          router.push('/')
      },
    }
  )
  const deleteTaskMutation = useMutation(
    async (id: number) => {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/todo/${id}`)
    },
    {
      onSuccess: (_, variables) => {
        const previosTodos = queryClient.getQueryData<Task[]>(['tasks'])
        if (previosTodos) {
          queryClient.setQueryData(
            ['tasks'],
            previosTodos.filter((task) => task.id !== variables)
          )
        }
      },
      onError: (error: any) => {
        if (error.response.status === 401 || error.response.status === 403)
          router.push('/')
      },
    }
  )
  return { createTaskMutation, updateTaskMutation, deleteTaskMutation }
}
