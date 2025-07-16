import React from 'react';

interface StaticImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const StaticImage: React.FC<StaticImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default StaticImage; 