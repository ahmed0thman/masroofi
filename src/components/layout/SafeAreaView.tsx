import { cn } from '@/lib/utils';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaViwe, SafeAreaViewProps } from 'react-native-safe-area-context';
const StyledSafeAreaView = styled(RNSafeAreaViwe);

interface StyledSafeAreaViewProps extends SafeAreaViewProps {
  theme?: 'light' | 'dark';
}

const SafeAreaView = ({
  children,
  className,
  theme = 'light',
  ...rest
}: StyledSafeAreaViewProps) => {
  //   TODO: read the status bar style from the global state manager and set it here
  return (
    <StyledSafeAreaView className={cn('dark bg-background flex-1 p-5', className)} {...rest}>
      {children}
    </StyledSafeAreaView>
  );
};

export default SafeAreaView;
