from dotenv import load_dotenv
from config.database import obtenerDatosDB_Varios_Descarga
import os, re, json
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import landscape, A4
from io import BytesIO
from config.database import obtenerDatosDB_Varios_Descarga
from datetime import datetime

# Mapeo de laboratorios a sus respectivas tablas en la base de datos.
lab_material = {
        'Y1-Y2': "labpotencia",
        'Y6-Y7': "labelectronica",
        'Y8': "labthird"
    }

# Carga las variables de entorno desde el archivo .env
load_dotenv(dotenv_path="config/.env")

# Lista de carreras profesionales disponibles en el instituto.
carreras_disponibles = os.getenv("CARRERAS_DISPONIBLES").split(",") if os.getenv("CARRERAS_DISPONIBLES") else []

def validar_correo(correo, identificador):
    """
    Valida si un correo electrónico cumple con el formato institucional esperado.
    
    Parámetros:
        correo: Correo electrónico a validar.
        identificador: Identificador esperado en el correo (número de control o ID).
    
    Retorna:
        bool: True si el correo es válido, False en caso contrario.
    """
    patron = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    patron = rf"^[a-zA-Z]?[0-9]*{re.escape(identificador)}@morelia\.tecnm\.mx$"
    return re.match(patron, correo) is not None

def generarListadeUsuariosPDF(usuario):
    """
    Genera un reporte PDF con la lista de usuarios según el tipo especificado.
    
    Parámetros:
        usuario: Tipo de usuario ('estudiantes', 'maestros' o 'caseteros').
    
    Retorna:
        BytesIO: Buffer con el PDF generado listo para descargar.
    """
    if usuario == 'estudiantes':
        sql = "SELECT ncontrol, correo, carrera, nombres, apellidos FROM usuarios"
        columnas = ["Número de Control", "Correo", "Carrera", "Nombres", "Apellidos"]
        col_widths = [50, 140, 160, 100, 100]
        tituloPDF = 'Estudiantes'
    elif usuario == 'maestros':
        sql = "SELECT * FROM maestros"
        columnas = ["Identificación", "Correo", "Nombres", "Apellidos", "Contraseña"]
        col_widths = [50, 160, 100, 100, 50]
        tituloPDF = 'Maestros'
    else:
        sql = "SELECT * FROM caseteros"
        columnas = ["Identificación", "Nombres", "Apellidos", "Laboratorio", "Correo", "Contraseña"]
        col_widths = [50, 100, 100, 50, 160, 50]
        tituloPDF = 'Caseteros'

    datos = obtenerDatosDB_Varios_Descarga(sql)

    # Prepara el buffer PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=30,
        rightMargin=30,
        topMargin=60,
        bottomMargin=40
    )

    # Estilos personalizados
    styles = getSampleStyleSheet()
    
    # Estilo para cabeceras de tabla
    style_header = ParagraphStyle(
        'header',
        parent=styles['Normal'],
        fontSize=3,
        leading=10,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=1  # Centrado
    )
    
    # Estilo para datos normales
    style_normal = ParagraphStyle(
        'normal',
        parent=styles['Normal'],
        fontSize=5,
        leading=10,
        fontName='Helvetica',
        wordWrap='CJK'
    )

    content = []

    # Título y fecha
    content.append(Paragraph(f"{tituloPDF} valesTECNM", styles['Title']))
    content.append(Paragraph(f"Generado el: {datetime.now().strftime('%d/%m/%Y')}", styles['Normal']))
    content.append(Spacer(1, 12))

    # Procesamos los datos
    all_tables = []
    
    # Cabecera de la tabla
    header_row = [Paragraph(col.upper(), style_header) for col in columnas[:-2]]  # Excluimos reporte y materiales
    all_tables.append(header_row)
    
    for fila in datos:
        main_data = []
        for item in fila:  # Excluimos las columnas de reporte e i_material
            text = str(item)
            main_data.append(Paragraph(text, style_normal))
        all_tables.append(main_data)
    # Crear la tabla principal
    tabla = Table(all_tables, colWidths=col_widths)
    
    # Estilo de la tabla
    table_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1c336c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D3D3D3')),
    ]

    tabla.setStyle(TableStyle(table_styles))

    content.append(tabla)

    # Pie de página profesional
    def agregar_pie(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(colors.HexColor('#4F81BD'))
        canvas.drawString(40, 20, "Sistema de Control de Laboratorios")
        canvas.drawRightString(doc.width + doc.leftMargin - 40, 20, f"Página {doc.page}")
        canvas.restoreState()

    doc.build(content, onFirstPage=agregar_pie, onLaterPages=agregar_pie)
    buffer.seek(0)
    return buffer

def generarListadeUsuariosCSV(usuario):
    """
    Genera un archivo CSV con la lista de usuarios según el tipo especificado.
    
    Parámetros:
        usuario: Tipo de usuario ('estudiantes', 'maestros' o 'caseteros').
    
    Retorna:
        generator: Generador que produce líneas del archivo CSV.
    """
    if usuario == 'estudiantes':
        sql = "SELECT ncontrol, correo, carrera, nombres, apellidos FROM usuarios"
        columnas = ["Número de Control", "Correo", "Carrera", "Nombres", "Apellidos"]
    elif usuario == 'maestros':
        sql = "SELECT * FROM maestros"
        columnas = ["Identificación", "Correo", "Nombres", "Apellidos", "Contraseña"]
    else:
        sql = "SELECT * FROM caseteros"
        columnas = ["Identificación", "Nombres", "Apellidos", "Laboratorio", "Correo", "Contraseña"]

    datos = obtenerDatosDB_Varios_Descarga(sql)

    # Producir el contenido CSV línea por línea.
    yield '\ufeff' + ','.join(columnas) + '\n'

    for fila in datos:
        fila = list(fila)
        fila_limpia = [str(col).replace('\n', ' ').replace(',', ';') for col in fila]
        yield ','.join(fila_limpia) + '\n'

def generarListaMaterialesCSV(laboratorio):
    """
    Genera un archivo CSV con el inventario completo de materiales de un laboratorio específico.
    El archivo está optimizado para su visualización en Excel y otras hojas de cálculo.

    Parámetros:
        laboratorio: Nombre del laboratorio del cual se generará el reporte.
    """
    condition = lab_material.get(laboratorio)

    # Obtener datos de la base de datos.
    sql = f"""
            SELECT 
                EQUIPO, MARCA, MODELO, N_CASETA, N_SERIE,
                N_INVENTARIO, VOLTAJE, POTENCIA, CANTIDAD,
                NUMERACION, OBSERVACIONES
            FROM ({condition}) ORDER BY NUMERACION DESC, EQUIPO, N_CASETA ASC
            """
    datos = obtenerDatosDB_Varios_Descarga(sql)

    # Definir encabezados de columnas.
    columnas = [
        "Equipo", "Marca", "Modelo", "Caseta", "N. Serie","N. Inventario", 
        "Voltaje", "Potencia", "Cantidad", "Numeracion", "Observaciones"
    ]

    # Producir el contenido CSV línea por línea.
    yield '\ufeff' + ','.join(columnas) + '\n'

    for fila in datos:
        fila = list(fila)
        fila_limpia = [str(col).replace('\n', ' ').replace(',', ';') for col in fila]
        yield ','.join(fila_limpia) + '\n'

def generarMaterialesPDF(laboratorio):
    """
    Genera un reporte PDF profesional del inventario de materiales de un laboratorio específico.

    Parámetros:
        laboratorio: Nombre del laboratorio para el cual se generará el reporte.

    Retorna:
        BytesIO: Buffer con el archivo PDF generado listo para descargar.
    """
    condition = lab_material.get(laboratorio)
    # Obtener datos de la base de datos
    sql = f"""
            SELECT 
                EQUIPO, MARCA, MODELO, N_CASETA, N_SERIE,
                N_INVENTARIO, VOLTAJE, POTENCIA, CANTIDAD,
                NUMERACION, OBSERVACIONES
            FROM ({condition}) ORDER BY NUMERACION DESC, EQUIPO, N_CASETA ASC
            """
    datos = obtenerDatosDB_Varios_Descarga(sql)

    columnas = [
        "Equipo", "Marca", "Modelo", "Caseta", "N. Serie","N. Inventario", 
        "Voltaje", "Potencia", "Cantidad", "Numeracion"
    ]

    # Prepara el buffer PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=30,
        rightMargin=30,
        topMargin=60,
        bottomMargin=40
    )

    # Estilos personalizados
    styles = getSampleStyleSheet()
    
    # Estilo para cabeceras de tabla
    style_header = ParagraphStyle(
        'header',
        parent=styles['Normal'],
        fontSize=3,
        leading=10,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=1  # Centrado
    )
    
    # Estilo para datos normales
    style_normal = ParagraphStyle(
        'normal',
        parent=styles['Normal'],
        fontSize=5,
        leading=10,
        fontName='Helvetica',
        wordWrap='CJK'
    )

    content = []

    # Título y fecha
    content.append(Paragraph(f"Materiales - {laboratorio}", styles['Title']))
    content.append(Paragraph(f"Generado el: {datetime.now().strftime('%d/%m/%Y')}", styles['Normal']))
    content.append(Spacer(1, 12))

    # Procesamos los datos
    all_tables = []
    
    # Definir anchos de columnas proporcionales
    col_widths = [60, 40, 50, 40, 80, 80, 40, 40, 30, 30]
    
    # Cabecera de la tabla
    header_row = [Paragraph(col.upper(), style_header) for col in columnas]  # Excluimos reporte y materiales
    all_tables.append(header_row)
    
    for fila in datos:
        main_data = []
        for item in fila[:-1]:
            text = str(item)
            main_data.append(Paragraph(text, style_normal))
        all_tables.append(main_data)

        # Fila de reporte - abarca todas las columnas
        reporte_text = f"<b>OBSERVACIONES:</b> {fila[-1]}"
        reporte_paragraph = Paragraph(reporte_text, style_normal)
        reporte_row = [reporte_paragraph] + [''] * (len(col_widths) - 1)  # solo la primera celda con texto
        all_tables.append(reporte_row)

    # Crear la tabla principal
    tabla = Table(all_tables, colWidths=col_widths)
    
    # Estilo de la tabla
    table_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1c336c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D3D3D3')),
    ]

    # Detectamos las filas de reporte para hacerles SPAN
    for i in range(1, len(all_tables)):
        if all_tables[i][1:] == [''] * (len(col_widths) - 1):  # solo la primera celda con texto
            table_styles.append(('SPAN', (0, i), (-1, i)))

    tabla.setStyle(TableStyle(table_styles))

    content.append(tabla)

    # Pie de página profesional
    def agregar_pie(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(colors.HexColor('#4F81BD'))
        canvas.drawString(40, 20, "Sistema de Control de Laboratorios")
        canvas.drawRightString(doc.width + doc.leftMargin - 40, 20, f"Página {doc.page}")
        canvas.restoreState()

    doc.build(content, onFirstPage=agregar_pie, onLaterPages=agregar_pie)
    buffer.seek(0)
    return buffer

def generarListaPDF():
    """
    Genera un reporte PDF con todos los registros del sistema.
    
    Retorna:
        BytesIO: Buffer con el PDF generado listo para descargar.
    """
    sql = f"""
            SELECT 
                ncontrol, hora_solicitud, fecha_solicitud, hora_final, fecha_final,
                name, lastname, teacher, casetero, topic, grupo, number_group,
                laboratory, tipo_vale, reporte, i_material
            FROM registro ORDER BY fecha_final ASC
            """
    datos = obtenerDatosDB_Varios_Descarga(sql)

    columnas = [
        "ID", "Hora Solicitud", "Fecha Solicitud", "Hora Final", "Fecha Final",
        "Nombre", "Apellido", "Profesor", "Casetero", "Tema", "Grupo", "No. Grupo",
        "LAB", "Vale", 'Reporte', 'Materiales'
    ]

    # Prepara el buffer PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=30,
        rightMargin=30,
        topMargin=60,
        bottomMargin=40
    )

    # Estilos personalizados
    styles = getSampleStyleSheet()
    
    # Estilo para cabeceras de tabla
    style_header = ParagraphStyle(
        'header',
        parent=styles['Normal'],
        fontSize=3,
        leading=10,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=1  # Centrado
    )
    
    # Estilo para datos normales
    style_normal = ParagraphStyle(
        'normal',
        parent=styles['Normal'],
        fontSize=5,
        leading=10,
        fontName='Helvetica',
        wordWrap='CJK'
    )

    content = []

    # Título y fecha
    content.append(Paragraph(f"Registros", styles['Title']))
    content.append(Paragraph(f"Generado el: {datetime.now().strftime('%d/%m/%Y')}", styles['Normal']))
    content.append(Spacer(1, 12))

    # Procesamos los datos
    all_tables = []
    
    # Definir anchos de columnas proporcionales
    col_widths = [50, 40, 50, 40, 50, 60, 60, 60, 60, 50, 30, 30, 30, 50]
    
    # Cabecera de la tabla
    header_row = [Paragraph(col.upper(), style_header) for col in columnas[:-2]]  # Excluimos reporte y materiales
    all_tables.append(header_row)
    
    for fila in datos:
        main_data = []
        for item in fila[:-2]:  # Excluimos las columnas de reporte e i_material
            text = str(item)
            main_data.append(Paragraph(text, style_normal))
        all_tables.append(main_data)

        # Fila combinada de REPORTE y MATERIAL
        reporte_text = f"<b>REPORTE:</b><br/>{fila[-2]}"
        materiales = json.loads(fila[-1])
        material_items = [f"> {m[0]} - {m[1]}" for m in materiales if len(m) == 2]
        material_text = f"<b>MATERIAL:</b><br/>" + "<br/>".join(material_items)

        # Crear los dos párrafos
        reporte_paragraph = Paragraph(reporte_text, style_normal)
        material_paragraph = Paragraph(material_text, style_normal)

        # Fila de dos celdas con contenido, resto en blanco
        num_cols = len(col_widths)
        half_cols = num_cols // 2

        # Primera celda ocupa la mitad izquierda, segunda celda la derecha
        fila_extra = [reporte_paragraph] + [''] * (half_cols - 1) + [material_paragraph] + [''] * (num_cols - half_cols - 1)
        all_tables.append(fila_extra)

    # Crear la tabla principal
    tabla = Table(all_tables, colWidths=col_widths)
    
    # Estilo de la tabla
    table_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1c336c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D3D3D3')),
    ]

    # Detectamos las filas de reporte para hacerles SPAN
    for i in range(1, len(all_tables)):
        if all_tables[i][1:] == [''] * (len(col_widths) - 1):  # Solo una celda con texto (caso antiguo)
            table_styles.append(('SPAN', (0, i), (-1, i)))
        elif all_tables[i].count('') == len(col_widths) - 2:  # Dos celdas con texto, el nuevo caso
            table_styles.append(('SPAN', (0, i), (half_cols - 1, i)))  # Span para reporte
            table_styles.append(('SPAN', (half_cols, i), (num_cols - 1, i)))  # Span para material

    tabla.setStyle(TableStyle(table_styles))

    content.append(tabla)

    # Pie de página profesional
    def agregar_pie(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(colors.HexColor('#4F81BD'))
        canvas.drawString(40, 20, "Sistema de Control de Laboratorios")
        canvas.drawRightString(doc.width + doc.leftMargin - 40, 20, f"Página {doc.page}")
        canvas.restoreState()

    doc.build(content, onFirstPage=agregar_pie, onLaterPages=agregar_pie)
    buffer.seek(0)
    return buffer

def generarListaCSV():
    """
    Genera un archivo CSV con todos los registros del sistema.
    
    Retorna:
        generator: Generador que produce líneas del archivo CSV.
    """
    sql = f"""
            SELECT 
                ncontrol, hora_solicitud, fecha_solicitud, hora_final, fecha_final,
                name, lastname, teacher, casetero, topic, grupo, number_group,
                laboratory, tipo_vale, reporte, i_material
            FROM registro ORDER BY fecha_final ASC
            """
    datos = obtenerDatosDB_Varios_Descarga(sql)

    columnas = [
        "Identificación", "Hora Solicitud", "Fecha Solicitud", "Hora Final", "Fecha Final",
        "Nombre", "Apellido", "Profesor", "Casetero", "Tema", "Grupo", "No. Grupo",
        "Laboratorio", "Vale", 'Reporte', 'Materiales'
    ]

    # BOM UTF-8 para compatibilidad con Excel
    yield '\ufeff' + ','.join(columnas) + '\n'

    for fila in datos:
        fila = list(fila)
        try:
            materiales = json.loads(fila[-1])  # Asumimos que i_material es la última columna
            texto_materiales = ' | '.join(f"{item[0]}: {item[1]}" for item in materiales)
            fila[-1] = texto_materiales
        except Exception as e:
            fila[-1] = f"Error JSON: {e}"

        fila_limpia = [str(col).replace('\n', ' ').replace(',', ';') for col in fila]
        yield ','.join(fila_limpia) + '\n'