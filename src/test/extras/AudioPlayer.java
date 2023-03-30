package test.extras;

import javax.sound.sampled.*;

public class AudioPlayer {

    private static final int SAMPLE_RATE = 44100;
    private static final int BUFFER_SIZE = 4096;

    public static void playNote(double frequency, int durationMs) throws LineUnavailableException {
        byte[] audioBuffer = generateTone(frequency, durationMs);
        playSound(audioBuffer);
    }

    public static void playPositiveSound() throws LineUnavailableException {
        byte[] audioBuffer = generatePositiveSound();
        playSound(audioBuffer);
    }

    public static void playNegativeSound() throws LineUnavailableException {
        byte[] audioBuffer = generateNegativeSound();
        playSound(audioBuffer);
    }

    public static void playHappyBirthday() throws LineUnavailableException {
        double[] melody = {
                261.63, 261.63, 293.66, 261.63, 349.23, 329.63, 261.63,
                261.63, 293.66, 261.63, 392.00, 349.23, 261.63,
                261.63, 523.25, 440.00, 349.23, 329.63, 293.66, 493.88, 493.88,
                440.00, 349.23, 392.00, 349.23
        };
        int[] durations = {
                200, 200, 400, 400, 400, 800, 400,
                200, 200, 400, 400, 400, 800,
                200, 400, 400, 400, 400, 800, 200, 200,
                400, 400, 400, 800
        };

        for (int i = 0; i < melody.length; i++) {
            playNote(melody[i], durations[i]);
        }
    }
    public static void playVictory() throws LineUnavailableException {
        double[] melody = {
                523.25, 659.26, 783.99, 932.33, 783.99, 659.26, 523.25
        };
        int[] durations = {
                400, 400, 400, 800, 400, 400, 800
        };

        for (int i = 0; i < melody.length; i++) {
            playNote(melody[i], durations[i]);
        }
    }
    public static void playVictorySong() throws LineUnavailableException {
        double[] melody = {
                659.26, 659.26, 783.99, 1046.50,
                1046.50, 783.99, 659.26, 659.26,
                783.99, 880.00, 880.00, 1046.50,
                1046.50, 880.00, 783.99, 783.99,
                659.26, 659.26, 783.99, 1046.50,
                1046.50, 783.99, 659.26, 659.26,
                523.25, 587.33, 659.26, 659.26,
                587.33, 523.25, 523.25, 587.33,
                587.33, 659.26, 659.26, 783.99,
                783.99, 880.00, 880.00, 1046.50,
                1046.50, 880.00, 783.99, 783.99,
                659.26, 659.26, 783.99, 1046.50,
                1046.50, 783.99, 659.26, 659.26
        };
        int[] durations = {
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150,
                300, 300, 450, 150
        };

        for (int i = 0; i < melody.length; i++) {
            playNote(melody[i], durations[i]);
        }
    }


    public static void playDefeat() throws LineUnavailableException {
        double[] melody = {
                293.66, 261.63, 220.00, 174.61, 146.83, 130.81
        };
        int[] durations = {
                800, 400, 400, 800, 400, 400
        };

        for (int i = 0; i < melody.length; i++) {
            playNote(melody[i], durations[i]);
        }
    }
    public static void playCorrect() throws LineUnavailableException {
        double[] melody = {
                659.26, 783.99, 1046.50
        };
        int[] durations = {
                200, 200, 400
        };

        for (int i = 0; i < melody.length; i++) {
            playNote(melody[i], durations[i]);
        }
    }

    public static void playIncorrect() throws LineUnavailableException {
        double[] melody = {
                293.66, 349.23, 415.30
        };
        int[] durations = {
                200, 200, 400
        };

        for (int i = 0; i < melody.length; i++) {
            playNote(melody[i], durations[i]);
        }
    }

    private static byte[] generateTone(double frequency, int durationMs) {
        int numSamples = durationMs * SAMPLE_RATE / 1000;
        byte[] audioBuffer = new byte[numSamples];

        for (int i = 0; i < numSamples; i++) {
            double angle = 2.0 * Math.PI * i * frequency / SAMPLE_RATE;
            audioBuffer[i] = (byte) (Math.sin(angle) * 127.0);
        }

        return audioBuffer;
    }

    private static byte[] generatePositiveSound() {
        return generateTone(500.0, 250);
    }

    private static byte[] generateNegativeSound() {
        return generateTone(250.0, 500);
    }

    private static void playSound(byte[] audioBuffer) throws LineUnavailableException {
        AudioFormat audioFormat = new AudioFormat(SAMPLE_RATE, 8, 1, true, false);
        SourceDataLine line = AudioSystem.getSourceDataLine(audioFormat);
        line.open(audioFormat, BUFFER_SIZE);
        line.start();
        line.write(audioBuffer, 0, audioBuffer.length);
        line.drain();
        line.close();
    }
    public static void main(String[] args) throws LineUnavailableException {
        // Ejemplos de uso
        AudioPlayer.playHappyBirthday();
        //AudioPlayer.playIncorrect();
        //AudioPlayer.playCorrect();
    }

}
