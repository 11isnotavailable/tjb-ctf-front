<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
    <!-- 简化的天眼图标，适用于小尺寸 -->
    
    <!-- 外圈 -->
    <polygon 
      points="16,4 22,8 24,16 22,24 16,28 10,24 8,16 10,8"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    />
    
    <!-- 天眼主体 -->
    <ellipse 
      cx="16" 
      cy="16" 
      rx="6" 
      ry="4"
      fill="currentColor"
      opacity="0.3"
    />
    
    <!-- 瞳孔 -->
    <circle 
      cx="16" 
      cy="16" 
      r="2.5"
      fill="currentColor"
    />
    
    <!-- 扫描点 -->
    <circle cx="12" cy="12" r="0.8" fill="currentColor" opacity="0.6"/>
    <circle cx="20" cy="12" r="0.8" fill="currentColor" opacity="0.6"/>
    <circle cx="12" cy="20" r="0.8" fill="currentColor" opacity="0.6"/>
    <circle cx="20" cy="20" r="0.8" fill="currentColor" opacity="0.6"/>
  </svg>
</template>
