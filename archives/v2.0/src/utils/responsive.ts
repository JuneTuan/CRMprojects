import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'

export const responsive = {
  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  },
  paddingX: {
    xs: 'px-2',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6'
  },
  paddingY: {
    xs: 'py-2',
    sm: 'py-3',
    md: 'py-4',
    lg: 'py-6'
  },
  margin: {
    xs: 'm-2',
    sm: 'm-3',
    md: 'm-4',
    lg: 'm-6'
  },
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  },
  text: {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  },
  button: {
    xs: 'px-3 py-2 text-xs',
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  },
  input: {
    xs: 'px-3 py-2 text-xs',
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  },
  card: {
    xs: 'p-3 rounded-lg',
    sm: 'p-4 rounded-xl',
    md: 'p-5 rounded-2xl',
    lg: 'p-6 rounded-2xl'
  }
}

export const getResponsiveClass = (classes: Record<string, string>, breakpoint: 'xs' | 'sm' | 'md' | 'lg' = 'md') => {
  return classes[breakpoint] || classes.md
}

export const useResponsive = () => {
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Taro.getSystemInfoSync().windowWidth)
    }

    handleResize()
    Taro.onWindowResize(handleResize)

    return () => {
      Taro.offWindowResize(handleResize)
    }
  }, [])

  const getBreakpoint = (): 'xs' | 'sm' | 'md' | 'lg' => {
    if (screenWidth < 375) return 'xs'
    if (screenWidth < 768) return 'sm'
    if (screenWidth < 1024) return 'md'
    return 'lg'
  }

  return {
    screenWidth,
    breakpoint: getBreakpoint(),
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024
  }
}
