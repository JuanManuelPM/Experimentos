package test.games.Pong;

import javax.swing.JFrame;

public class PongMain {
    public static void main(String[] args) {
        Ventana ventana = new Ventana();
        ventana.setVisible(true);
        ventana.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
}
