import React, {Component} from 'react';
import {
    AppRegistry,
    PermissionsAndroid,
    StyleSheet,
    Text,
    View,
    Platform
} from 'react-native';

import AnylineOCR from 'anyline-ocr-react-native-module';

import Result from './Result';

import config from '../config';


class Anyline extends Component {

    state = {
        hasScanned: false,
        result: '',
        imagePath: '',
        fullImagePath: '',
        barcode: '',
        scanMode: '',
        meterType: '',
        cutoutBase64: '',
        fullImageBase64: '',
    };

    openOCR = () => {
        AnylineOCR.setupScanViewWithConfigJson(
            JSON.stringify(config),
            'ANALOG_METER',
            this.onResult,
            this.onError
        );
    };

    requestCameraPermission = async() => {


        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Camera permission allowed');
                this.openOCR();
            } else {
                console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    };

    hasCameraPermission = async() => {
        try {
            const result = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.CAMERA);
            return result;
        } catch (err) {
            console.warn(err);
        }
    };

    checkCameraPermissionAndOpen = () => {
        this.hasCameraPermission().then((hasCameraPermission) => {
            console.log('hasCameraPermission result is ' + hasCameraPermission);
            if (hasCameraPermission) {
                console.log('Opening OCR directly');
                this.openOCR();
            } else {
                this.requestCameraPermission();
            }
        });
    };

    onResult = (dataString) => {
        const data = JSON.parse(dataString);

        this.setState({
            hasScanned: true,
            result: data.reading,
            imagePath: data.imagePath,
            fullImagePath: data.fullImagePath,
            scanMode: data.scanMode,
            meterType: data.meterType,
            cutoutBase64: data.cutoutBase64,
            fullImageBase64: data.fullImageBase64,
        });
    };

    onError = (error) => {
        console.error(error);
        alert(error);
    };

    render() {
        const {
            hasScanned,
            result,
            imagePath,
            fullImagePath,
            barcode,
            scanMode,
            meterType,
            cutoutBase64,
            fullImageBase64,
        } = this.state;

        const platformText = (Platform.OS === 'android') ?
            (<Text onPress={this.checkCameraPermissionAndOpen}>Open OCR reader!</Text>) :
            (<Text onPress={this.openOCR}>Open OCR reader!</Text>);

        return (
            <View style={styles.container}>
                {hasScanned ? (
                        <Result
                            result={result}
                            imagePath={imagePath}
                            fullImagePath={fullImagePath}
                            barcode={barcode}
                            scanMode={scanMode}
                            meterType={meterType}
                            cutoutBase64={cutoutBase64}
                            fullImageBase64={fullImageBase64}
                        />
                    ) : (
                        platformText
                    )}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
});

AppRegistry.registerComponent('Anyline', () => Anyline);
