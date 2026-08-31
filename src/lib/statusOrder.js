export const STATUS_ORDER = {
 in_progress: 0,
 stuck: 1,
 blocker: 2,
 not_started: 3,
 open: 3,
 done: 4,
}

export const STATUS_LABEL = {
 in_progress: 'In progress',
 stuck: 'Stuck',
 blocker: 'Blocker',
 not_started: 'Not started',
 open: 'Not started',
 done: 'Done',
}

export function statusRank(status) {
 const key = status === 'open' ? 'not_started' : (status || 'not_started')
 return STATUS_ORDER[key] ?? STATUS_ORDER.not_started
}
