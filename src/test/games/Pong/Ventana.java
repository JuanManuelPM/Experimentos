package test.games.Pong;

import javax.swing.*;

public class Ventana extends JFrame {
    private final int anchoDeVentana = 800, altoDeVentana = 500;
    private TableroJuego lamina;
    public Ventana(){
        setTitle("Pong");
        setSize(altoDeVentana, altoDeVentana);
        setTitle("Pong");
        setSize(anchoDeVentana, altoDeVentana);
        setLocationRelativeTo(null); //ubicando la ventana en el centro de la pantalla
        setResizable(false);
        lamina = new TableroJuego();
        add(lamina);
    }
}
