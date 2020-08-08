import {
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Message,
  Col,
  Row,
  Table,
  TableColumn,
  Dialog,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Breadcrumb,
  BreadcrumbItem,
  Backtop,
  Icon,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Tag,
  Scrollbar,
  Pagination,
  Card,
  Form,
  FormItem
} from 'element-ui'

const components = [
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Message,
  Row,
  Col,
  Table,
  TableColumn,
  InputNumber,
  Dialog,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Breadcrumb,
  BreadcrumbItem,
  Backtop,
  Icon,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Tag,
  Scrollbar,
  Pagination,
  Card,
  Form,
  FormItem
]

const install = function install (Vue) {
  if (install.installed) return

  components.forEach((component) => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
