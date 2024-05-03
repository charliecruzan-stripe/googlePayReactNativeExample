/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';

import {Header} from 'react-native/Libraries/NewAppScreen';
import {
  PlatformPayButton,
  initStripe,
  isPlatformPaySupported,
  PlatformPay,
  initPaymentSheet,
  presentPaymentSheet,
  confirmPlatformPayPayment,
} from '@stripe/stripe-react-native';

const LOCAL_URL = 'http://10.0.2.2:3000';

function App(): React.JSX.Element {
  const [showButton, setShowButton] = React.useState(false);

  const initializeStripeAndGooglePay = async () => {
    await initStripe({
      publishableKey: '<YOUR-PUBLISHABLE-KEY>',
    });
    setShowButton(
      await isPlatformPaySupported({
        googlePay: {testEnv: true, existingPaymentMethodRequired: false},
      }),
    );
  };

  React.useEffect(() => {
    initializeStripeAndGooglePay();
  }, []);

  const fetchPaymentIntent = async (): Promise<string> => {
    const response = await fetch(`${LOCAL_URL}/payment_sheet`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const {paymentIntent} = await response.json();

    return paymentIntent;
  };

  const purchaseWithGooglePay = async () => {
    const paymentIntentSecret = await fetchPaymentIntent();
    const {error, paymentIntent} = await confirmPlatformPayPayment(
      paymentIntentSecret,
      {
        googlePay: {
          testEnv: true,
          merchantCountryCode: 'US',
          currencyCode: 'eur',
          amount: 10,
        },
      },
    );

    if (error) {
      console.log('We hit an error: ' + error.code);
    } else if (paymentIntent) {
      console.log('Success!');
      console.log(paymentIntent);
    }
  };

  const purchaseWithPaymentSheet = async () => {
    const paymentIntent = await fetchPaymentIntent();
    const {error: initError} = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      merchantDisplayName: 'the fruit stand',
      googlePay: {
        testEnv: true,
        currencyCode: 'eur',
        merchantCountryCode: 'US',
      },
    });
    if (initError) {
      console.log('We hit an error: ' + initError);
    }

    const {error, paymentOption} = await presentPaymentSheet();
    if (error) {
      console.log('We hit an error: ' + error.code);
    } else if (paymentOption) {
      console.log('Success!');
      console.log(paymentOption);
    }
  };

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Header />
        <View>
          {showButton ? (
            <PlatformPayButton
              type={PlatformPay.ButtonType.GooglePayMark}
              style={styles.button}
              onPress={purchaseWithGooglePay}
            />
          ) : (
            <Text>Looks like Google Pay doesnt work ☹️</Text>
          )}
          <Button
            title="Buy with PaymentSheet"
            onPress={purchaseWithPaymentSheet}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    marginBottom: 10,
  },
});

export default App;
