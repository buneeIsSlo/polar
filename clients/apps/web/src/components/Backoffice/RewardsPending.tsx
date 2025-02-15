'use client'

import {
  useBackofficePledgeCreateInvoice,
  useBackofficeRewardsPending,
} from '@/hooks/queries'
import { api } from '@/utils/client'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/20/solid'
import { schemas, unwrap } from '@polar-sh/client'
import Avatar from '@polar-sh/ui/components/atoms/Avatar'
import Button from '@polar-sh/ui/components/atoms/Button'
import {
  formatCurrencyAndAmount,
  getCentsInDollarString,
} from '@polar-sh/ui/lib/money'
import Link from 'next/link'
import { Fragment, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

const Pledges = () => {
  const rewards = useBackofficeRewardsPending()

  const groupRewardsByPledge = (
    rewards: Array<schemas['BackofficeReward']>,
  ): Array<Array<schemas['BackofficeReward']>> => {
    const byPledgeId =
      rewards.reduce(
        (hash: Record<string, Array<schemas['BackofficeReward']>>, obj) => ({
          ...hash,
          [obj.pledge.id]: (hash[obj.pledge.id] || []).concat(obj),
        }),
        {},
      ) || {}
    return Object.values(byPledgeId)
  }

  const groupRewardsByIssue = (
    rewards: Array<schemas['BackofficeReward']>,
  ): Array<Array<schemas['BackofficeReward']>> => {
    const byIssueId =
      rewards.reduce(
        (hash: Record<string, Array<schemas['BackofficeReward']>>, obj) => ({
          ...hash,
          [obj.pledge.issue.id]: (hash[obj.pledge.issue.id] || []).concat(obj),
        }),
        {},
      ) || {}
    return Object.values(byIssueId)
  }

  const issueList = useMemo(() => {
    return groupRewardsByIssue(rewards.data?.items || []).map((r) =>
      groupRewardsByPledge(r),
    )
    // const byIssue =
    //   rewards.data?.items.reduce(
    //     (hash: Record<string, Array<schemas['BackofficeReward']>>, obj) => ({
    //       ...hash,
    //       [obj.pledge.issue.id]: (hash[obj.pledge.issue.id] || []).concat(obj),
    //     }),
    //     {},
    //   ) || {}

    // return Object.values(byIssue)
  }, [rewards])

  const createInvoice = useBackofficePledgeCreateInvoice()

  const onClickCreateInvoice = async (pledgeId: string) => {
    await createInvoice.mutateAsync({ pledgeId })
  }

  const pledgeRewardsGroupBorder = (idx: number): string => {
    const c = [
      'border-emerald-500',
      'border-violet-500',
      'border-purple-500',
      'border-orange-500',
    ]
    return c[idx % c.length]
  }

  return (
    <div className="space-y-4">
      {issueList.map((i) => (
        <div key={i[0][0].pledge.issue.id}>
          <div className="flex gap-2">
            <Link
              className="text-blue-500"
              href={`/backoffice/issue/${i[0][0].pledge.issue.id}`}
            >
              {i[0][0].pledge.issue.repository.organization.name}/
              {i[0][0].pledge.issue.repository.name}#
              {i[0][0].pledge.issue.number}
            </Link>

            <span>&quot;{i[0][0].pledge.issue.title}&quot;</span>

            {i[0][0].pledge.issue.confirmed_solved_at ? (
              <div className="flex items-center rounded-full bg-green-400 px-2 text-sm text-white">
                confirmed solved
              </div>
            ) : (
              <div className="flex items-center rounded-full bg-orange-400 px-2 text-sm text-white">
                not confirmed solved
              </div>
            )}

            {i[0][0].pledge.issue.needs_confirmation_solved ? (
              <div className="flex items-center rounded-full bg-green-400 px-2 text-sm text-white">
                awaiting confirmation
              </div>
            ) : (
              <div className="flex items-center rounded-full bg-orange-400 px-2 text-sm text-white">
                not awaiting confirmation
              </div>
            )}

            <a
              href={`https://github.com/${i[0][0].pledge.issue.repository.organization.name}/${i[0][0].pledge.issue.repository.name}/issues/${i[0][0].pledge.issue.number}`}
            >
              <Button size="sm" variant={'outline'}>
                <span>GitHub</span>
                <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
          <table className="w-full table-auto p-4">
            <tr>
              <th>From/To</th>
              <th>State</th>
              <th>Actions</th>
              <th>Scheduled At</th>
            </tr>
            {i.map((p, idx) => (
              <Fragment key={p[0].issue_reward_id + p[0].pledge.id}>
                <tr
                  className={twMerge(
                    'border-l-4 p-2',
                    pledgeRewardsGroupBorder(idx),
                  )}
                >
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <ArrowLeftIcon className="h-4 w-4 text-green-600" />
                      <div>
                        $
                        {formatCurrencyAndAmount(
                          p[0].pledge.amount,
                          p[0].pledge.currency,
                        )}{' '}
                        from{' '}
                      </div>
                      {p[0].pledge.pledger?.avatar_url && (
                        <img
                          className="h-6 w-6"
                          src={p[0].pledge.pledger.avatar_url}
                        />
                      )}
                      <div className="underline">
                        {p[0].pledge.pledger?.github_username ||
                          p[0].pledge.pledger?.name ||
                          'Anonymous'}
                      </div>
                      <div>{p[0].pledger_email}</div>
                    </div>
                  </td>

                  {/* State */}
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className={twMerge(
                          'inline-flex items-center rounded-full px-2 text-sm text-white',
                          p[0].pledge.state === 'charge_disputed' ||
                            p[0].pledge.state === 'disputed'
                            ? 'bg-red-700'
                            : '',
                          p[0].pledge.state === 'pending' ? 'bg-green-700' : '',
                          p[0].pledge.state === 'created' ? 'bg-blue-300' : '',
                        )}
                      >
                        state={p[0].pledge.state}
                      </div>

                      <div
                        className={twMerge(
                          'inline-flex items-center rounded-full px-2 text-sm text-white',
                          p[0].pledge.type === 'pay_upfront'
                            ? 'bg-green-700'
                            : '',
                          p[0].pledge.type === 'pay_on_completion'
                            ? 'bg-red-700'
                            : '',
                        )}
                      >
                        type={p[0].pledge.type}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex gap-2">
                      {p[0].pledge.type === 'pay_on_completion' && (
                        <>
                          {p[0].pledge.hosted_invoice_url ? (
                            <a
                              href={p[0].pledge.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant={'outline'}>
                                <span className="whitespace-nowrap">
                                  Invoice
                                </span>
                                <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" />
                              </Button>
                            </a>
                          ) : (
                            <Button
                              color="gray"
                              size="sm"
                              onClick={() =>
                                onClickCreateInvoice(p[0].pledge.id)
                              }
                            >
                              <span className="whitespace-nowrap">
                                Send Invoice
                              </span>
                              <BanknotesIcon className="ml-2 h-5 w-5" />
                            </Button>
                          )}
                        </>
                      )}

                      <a
                        href={`https://dashboard.stripe.com/payments/${p[0].pledge_payment_id}`}
                      >
                        <Button size="sm" variant={'outline'}>
                          <span>Payment</span>
                          <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" />
                        </Button>
                      </a>
                    </div>
                  </td>

                  <td>{p[0].pledge.scheduled_payout_at?.toString()}</td>
                </tr>

                {p.map((r) => (
                  <tr
                    key={r.issue_reward_id}
                    className={twMerge(
                      'border-l-4 bg-gray-200 p-2',
                      pledgeRewardsGroupBorder(idx),
                    )}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <ArrowRightIcon className="h-4 w-4 text-blue-500" />
                        <div>
                          ${getCentsInDollarString(r.amount.amount, true, true)}{' '}
                          to
                        </div>
                        {r.user && (
                          <>
                            <Avatar
                              avatar_url={r.user.avatar_url}
                              name={r.user.public_name}
                              className="h-6 w-6"
                            />
                            <div className="underline">
                              {r.user.public_name}
                            </div>
                          </>
                        )}
                        {r.organization && (
                          <>
                            <Avatar
                              avatar_url={r.organization.avatar_url}
                              name={r.organization.name}
                              className="h-6 w-6"
                            />
                            <div className="underline">
                              {r.organization.name}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* State */}
                    <td>
                      {r.paid_at ? (
                        <div className="inline-flex items-center rounded-full bg-green-400 px-2 text-sm text-white">
                          Paid {r.paid_at.toString()}
                        </div>
                      ) : (
                        <div className="inline-flex items-center rounded-full bg-green-400 px-2 text-sm text-white">
                          not paid out
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      {!r.paid_at && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            await unwrap(
                              api.POST('/v1/backoffice/pledges/approve', {
                                body: {
                                  pledge_id: r.pledge.id,
                                  issue_reward_id: r.issue_reward_id,
                                },
                              }),
                            )
                            alert('paid!')
                          }}
                        >
                          <span className="whitespace-nowrap">
                            Create transfer
                          </span>
                          <CurrencyDollarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </td>

                    <td>&nbsp;</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </table>
        </div>
      ))}
    </div>
  )
}

export default Pledges
