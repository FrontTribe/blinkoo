import { IconType } from 'react-icons'
import * as FiIcons from 'react-icons/fi'
import { ComponentType } from 'react'

interface DynamicIconProps {
  iconName: string
  className?: string
}

const iconMap: Record<string, ComponentType<any>> = {
  // Feather Icons
  FiGrid: FiIcons.FiGrid,
  FiCoffee: FiIcons.FiCoffee,
  FiFilm: FiIcons.FiFilm,
  FiShoppingBag: FiIcons.FiShoppingBag,
  FiTool: FiIcons.FiTool,
  FiActivity: FiIcons.FiActivity,
  FiHeart: FiIcons.FiHeart,
  FiMusic: FiIcons.FiMusic,
  FiCamera: FiIcons.FiCamera,
  FiSmile: FiIcons.FiSmile,
  FiBook: FiIcons.FiBook,
  FiPenTool: FiIcons.FiPenTool,
  FiMap: FiIcons.FiMap,
  FiMapPin: FiIcons.FiMapPin,
  FiHome: FiIcons.FiHome,
  FiGlobe: FiIcons.FiGlobe,
  FiStar: FiIcons.FiStar,
  FiTag: FiIcons.FiTag,
}

export function DynamicIcon({ iconName, className }: DynamicIconProps) {
  const IconComponent = iconMap[iconName] || FiIcons.FiGrid

  return <IconComponent className={className} />
}
