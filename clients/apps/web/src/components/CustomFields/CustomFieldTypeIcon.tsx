import {
  CalendarMonth,
  CheckBox,
  List,
  Numbers,
  TextSnippet,
} from '@mui/icons-material'
import { schemas } from '@polar-sh/client'

const getIcon = (type: schemas['CustomFieldType']) => {
  switch (type) {
    case 'text':
      return TextSnippet
    case 'number':
      return Numbers
    case 'date':
      return CalendarMonth
    case 'checkbox':
      return CheckBox
    case 'select':
      return List
  }
}

const CustomFieldTypeIcon = ({
  type,
}: {
  type: schemas['CustomFieldType']
}) => {
  const Icon = getIcon(type)

  return <Icon fontSize="inherit" />
}

export default CustomFieldTypeIcon
