'use client'

import AccountBanner from '@/components/Transactions/AccountBanner'
import TransactionsList from '@/components/Transactions/TransactionsList'
import { useSearchTransactions } from '@/hooks/queries'
import {
  DataTablePaginationState,
  DataTableSortingState,
  getAPIParams,
  serializeSearchParams,
} from '@/utils/datatable'
import { schemas } from '@polar-sh/client'
import { usePathname, useRouter } from 'next/navigation'

export default function ClientPage({
  pagination,
  sorting,
  organization,
}: {
  pagination: DataTablePaginationState
  sorting: DataTableSortingState
  organization: schemas['Organization']
}) {
  const router = useRouter()
  const pathname = usePathname()

  const setPagination = (
    updaterOrValue:
      | DataTablePaginationState
      | ((old: DataTablePaginationState) => DataTablePaginationState),
  ) => {
    const updatedPagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue

    router.push(
      `${pathname}?${serializeSearchParams(updatedPagination, sorting)}`,
    )
  }

  const setSorting = (
    updaterOrValue:
      | DataTableSortingState
      | ((old: DataTableSortingState) => DataTableSortingState),
  ) => {
    const updatedSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue

    router.push(
      `${pathname}?${serializeSearchParams(pagination, updatedSorting)}`,
    )
  }

  const transactionsHook = useSearchTransactions({
    payment_organization_id: organization.id,
    ...getAPIParams(pagination, sorting),
  })
  const transactions = transactionsHook.data?.items || []
  const transactionsCount = transactionsHook.data?.pagination.max_page ?? 1

  return (
    <div className="flex flex-col gap-y-6">
      <AccountBanner organization={organization} />
      <div className="mb-8 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h2 className="text-lg font-medium capitalize">Transactions</h2>
          <p className="dark:text-polar-500 text-sm text-gray-500">
            Payments made to maintainers on Polar
          </p>
        </div>
      </div>
      <TransactionsList
        transactions={transactions}
        pageCount={transactionsCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={transactionsHook.isLoading}
      />
    </div>
  )
}
