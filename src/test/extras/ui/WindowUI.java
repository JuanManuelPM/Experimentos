package test.extras.ui;

import javax.swing.*;
import java.io.File;

public class WindowUI {
    public static void showMessage(String message) {
        JOptionPane.showMessageDialog(null, message);
    }

    public static void showError(String message) {
        JOptionPane.showMessageDialog(null, message, "Error", JOptionPane.ERROR_MESSAGE);
    }

    public static void showWarning(String message) {
        JOptionPane.showMessageDialog(null, message, "Advertencia", JOptionPane.WARNING_MESSAGE);
    }

    public static boolean showQuestion(String message) {
        int result = JOptionPane.showConfirmDialog(null, message, "Pregunta", JOptionPane.YES_NO_OPTION);
        return result == JOptionPane.YES_OPTION;
    }

    public static String showOptions(String[] options) {
        return (String) JOptionPane.showInputDialog(null, "Seleccione una opción", "Opciones",
                JOptionPane.PLAIN_MESSAGE, null, options, options[0]);
    }

    public static String showInputDialog(String prompt) {
        return JOptionPane.showInputDialog(null, prompt);
    }

    public static int showInputIntDialog(String prompt) {
        String result = JOptionPane.showInputDialog(null, prompt);
        return Integer.parseInt(result);
    }

    public static double showInputDoubleDialog(String prompt) {
        String result = JOptionPane.showInputDialog(null, prompt);
        return Double.parseDouble(result);
    }

    public static File showFileChooser() {
        JFileChooser fileChooser = new JFileChooser();
        int result = fileChooser.showOpenDialog(null);
        if (result == JFileChooser.APPROVE_OPTION) {
            return fileChooser.getSelectedFile();
        } else {
            return null;
        }
    }
    public static void main(String[] args) {
        // Ejemplos de uso
        WindowUI.showMessage("¡Hola, mundo!");
        String input = WindowUI.showInputDialog("Ingrese un nombre");
        int number = WindowUI.showInputIntDialog("Ingrese un número entero");
        double decimal = WindowUI.showInputDoubleDialog("Ingrese un número decimal");
        String[] options = {"Opción 1", "Opción 2", "Opción 3"};
        String option = WindowUI.showOptions(options);
        boolean confirmed = WindowUI.showQuestion("¿Está seguro?");
        if (confirmed) {
            WindowUI.showMessage("El usuario seleccionó Sí.");
        } else {
            WindowUI.showMessage("El usuario seleccionó No.");
        }
    }
}
