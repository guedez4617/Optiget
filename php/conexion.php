<?php

    class conexion{
        private $servidor;
        private $usuario;
        private $contrasena;
        private $basedatos;
        public $conexion;

        public function construct(){
            $this->servidor = "localhost";
            $this->usuario = "robt";
            $this->contrasena = "";
            $this->basedatos = "Dondiego2016";

        }
        function conectar(){
            $this->conexion = new mysqli($this->servidor,$this->usuario,$this->contrasena,$this->basedatos);
            $this->conexion->set_charset("utf8");
        }
        function cerrar(){
            $this->conexion->close();
        }
    }
?>

