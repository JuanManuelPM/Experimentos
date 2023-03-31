package test.games.chatGPT;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class JuegoClicks extends JFrame implements ActionListener {
    private JButton boton;
    private JLabel etiqueta;
    private int contadorClicks = 0;
    private Timer temporizador;
    private int tiempoRestante = 10; // tiempo en segundos

    public JuegoClicks() {

        // Configurar la ventana
        setTitle("Juego de clicks");
        setSize(300, 200);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        // Crear el botón
        boton = new JButton("Haz clic aquí!");
        boton.addActionListener(this);

        // Crear la etiqueta del temporizador
        etiqueta = new JLabel("Tiempo restante: " + tiempoRestante);

        // Agregar los componentes a la ventana
        JPanel panel = new JPanel(new BorderLayout());
        panel.add(boton, BorderLayout.CENTER);
        panel.add(etiqueta, BorderLayout.SOUTH);
        add(panel);

        // Crear el temporizador
        temporizador = new Timer(1000, new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                tiempoRestante--;
                etiqueta.setText("Tiempo restante: " + tiempoRestante);
                if (tiempoRestante == 0) {
                    temporizador.stop();
                    boton.setEnabled(false);
                    JOptionPane.showMessageDialog(null, "Juego terminado. Clicks realizados: " + contadorClicks);
                }
            }
        });

        // Mostrar la ventana
        setVisible(true);

        // Iniciar el temporizador
        temporizador.start();
    }
    @Override
    public void actionPerformed(ActionEvent e) {
        contadorClicks++;
        boton.setText("Haz clic aquí! (" + contadorClicks + ")");
    }

    public static void main(String[] args) {
        new JuegoClicks();
    }
}
