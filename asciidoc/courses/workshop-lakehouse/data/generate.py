"""Generate the AutoFix Group sample dataset.

Deterministic generator for the genai-workshop-lakehouse course data.
The CSVs model two halves of a lakehouse:

- Document side (parsed PDFs): documents, sections, section_refs
- Lakehouse side (Delta table exports): vehicles, work_orders,
  work_order_parts, parts, procedures, dtc_codes

The two halves share part numbers and diagnostic trouble codes (DTCs) -
that shared-key overlap is what the workshop builds on.

Run: python3 generate.py  (writes CSVs next to this script)
"""

import csv
import os

OUT = os.path.dirname(os.path.abspath(__file__))


def write(name, header, rows):
    with open(os.path.join(OUT, name), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows)} rows")


# ---------------------------------------------------------------------------
# Document side - parsed from PDFs in cloud storage
# ---------------------------------------------------------------------------

documents = [
    # doc_id, doc_type, title, model, published
    ("MAN-FAL-3", "Manual", "Falcon Service Manual (3rd Edition)", "Falcon", "2019-03-01"),
    ("MAN-HER-2", "Manual", "Heron Service Manual (2nd Edition)", "Heron", "2020-06-15"),
    ("MAN-OSP-1", "Manual", "Osprey Service Manual (1st Edition)", "Osprey", "2021-01-20"),
    ("TSB-21-114", "Bulletin", "Revised Ignition Coil for Repeated Misfire", "Falcon", "2021-09-14"),
    ("TSB-22-031", "Bulletin", "Front Brake Judder After Pad Replacement", "Heron", "2022-04-02"),
    ("TSB-20-087", "Bulletin", "Intermittent Wheel Speed Sensor Faults", "Heron", "2020-11-30"),
    ("TSB-23-052", "Bulletin", "Battery Drain and Low System Voltage", "Falcon", "2023-02-17"),
    ("TSB-19-008", "Bulletin", "Catalyst Efficiency Code After Software Update", "Falcon", "2019-08-22"),
    ("RC-2021-04", "RecallNotice", "Safety Recall - Ignition Coil Connector Overheating", "Falcon", "2021-05-10"),
    ("RC-2022-09", "RecallNotice", "Safety Recall - Brake Hose Abrasion", "Heron", "2022-10-05"),
]

# section_id, doc_id, parent_id, seq, title, text
sections = [
    # Falcon Service Manual
    ("S-FAL-1", "MAN-FAL-3", "", 1, "Engine",
     "Service procedures for the 2.0T and 1.6 litre engine families."),
    ("S-FAL-1-1", "MAN-FAL-3", "S-FAL-1", 1, "Ignition System Overview",
     "The 2.0T engine uses one coil-on-plug ignition coil (part IC-2042-A) per cylinder with spark plug set SP-1108. Coils are matched to the engine calibration."),
    ("S-FAL-1-2", "MAN-FAL-3", "S-FAL-1", 2, "Ignition Coil Replacement",
     "Remove the engine cover and disconnect the coil connector. Replace ignition coil IC-2042-A as an assembly. Applies to misfire codes P0301 and P0300 after plug condition is confirmed."),
    ("S-FAL-1-3", "MAN-FAL-3", "S-FAL-1", 3, "Misfire Diagnosis",
     "For codes P0300 and P0301, swap coils between cylinders and retest. If the misfire follows the coil, replace it. Inspect spark plug set SP-1108 for gap and fouling."),
    ("S-FAL-1-4", "MAN-FAL-3", "S-FAL-1", 4, "Exhaust and Catalyst",
     "Catalyst efficiency code P0420 requires upstream and downstream oxygen sensor comparison before replacing catalytic converter CAT-5500."),
    ("S-FAL-2", "MAN-FAL-3", "", 2, "Electrical",
     "Charging, battery, and control module service."),
    ("S-FAL-2-1", "MAN-FAL-3", "S-FAL-2", 1, "Charging System",
     "Test alternator ALT-8810 output under load before replacing battery BAT-1200. Code P0562 indicates system voltage below threshold."),
    ("S-FAL-2-2", "MAN-FAL-3", "S-FAL-2", 2, "Engine Control Module",
     "Engine control module ECM-9901 must be programmed with the latest calibration after replacement."),
    ("S-FAL-3", "MAN-FAL-3", "", 3, "Brakes",
     "Brake system inspection and service."),
    ("S-FAL-3-1", "MAN-FAL-3", "S-FAL-3", 1, "Brake Pad Service",
     "Replace front pads with brake pad kit BP-7720. Measure rotor thickness before reuse."),

    # Heron Service Manual
    ("S-HER-1", "MAN-HER-2", "", 1, "Brakes",
     "Brake system service for all Heron variants."),
    ("S-HER-1-1", "MAN-HER-2", "S-HER-1", 1, "Front Brake Pad and Rotor Service",
     "Replace pads with brake pad kit BP-7720. On vehicles with judder complaints, replace rotors BR-7731 in pairs - do not machine."),
    ("S-HER-1-2", "MAN-HER-2", "S-HER-1", 2, "Brake Hose Inspection",
     "Inspect front brake hose BH-7745 for abrasion at the strut bracket at every service."),
    ("S-HER-1-3", "MAN-HER-2", "S-HER-1", 3, "ABS Diagnosis",
     "Codes C0035 and U0121 - check wheel speed sensor WSS-3300 wiring at the wheel arch before module replacement."),
    ("S-HER-2", "MAN-HER-2", "", 2, "Chassis Electrical",
     "Electrical service for chassis systems."),
    ("S-HER-2-1", "MAN-HER-2", "S-HER-2", 1, "Wheel Speed Sensor Replacement",
     "Replace wheel speed sensor WSS-3300 and route the harness clear of the spring. Clears code C0035 after relearn."),
    ("S-HER-2-2", "MAN-HER-2", "S-HER-2", 2, "Battery and Charging",
     "Battery BAT-1200 and alternator ALT-8810 service points are shared with the Falcon platform."),

    # Osprey Service Manual
    ("S-OSP-1", "MAN-OSP-1", "", 1, "Electrical",
     "Electrical service for the Osprey platform."),
    ("S-OSP-1-1", "MAN-OSP-1", "S-OSP-1", 1, "Wheel Speed Sensor Replacement",
     "Replace wheel speed sensor WSS-3300. Code C0035 indicates left front sensor circuit fault."),
    ("S-OSP-1-2", "MAN-OSP-1", "S-OSP-1", 2, "Charging System",
     "Alternator ALT-8810 output test. Code P0562 sets when system voltage is low at idle."),
    ("S-OSP-2", "MAN-OSP-1", "", 2, "Engine",
     "Engine service for the 3.5 V6."),
    ("S-OSP-2-1", "MAN-OSP-1", "S-OSP-2", 1, "Misfire Diagnosis",
     "For code P0300 inspect spark plug set SP-1108 and check for intake leaks before component replacement."),

    # TSB-21-114 - Revised Ignition Coil for Repeated Misfire
    ("S-TSB21114-1", "TSB-21-114", "", 1, "Condition",
     "Some 2019-2021 Falcon vehicles with the 2.0T engine exhibit repeat misfire codes P0301 or P0300 after a coil has already been replaced."),
    ("S-TSB21114-2", "TSB-21-114", "", 2, "Cause",
     "The original ignition coil IC-2042-A insulation can degrade under repeated heat cycles, causing intermittent misfire that returns after replacement with the same part."),
    ("S-TSB21114-3", "TSB-21-114", "", 3, "Repair Procedure",
     "Replace all coils with revised ignition coil IC-2042-B, which supersedes IC-2042-A. Replace spark plug set SP-1108 if beyond half service life. Do not reinstall IC-2042-A from stock."),

    # TSB-22-031 - Front Brake Judder After Pad Replacement
    ("S-TSB22031-1", "TSB-22-031", "", 1, "Condition",
     "Heron vehicles return with steering wheel vibration under braking within months of a front pad replacement using brake pad kit BP-7720."),
    ("S-TSB22031-2", "TSB-22-031", "", 2, "Repair Procedure",
     "Replace front rotors BR-7731 in pairs together with brake pad kit BP-7720. Pad-only repairs on worn rotors cause the judder to return."),

    # TSB-20-087 - Intermittent Wheel Speed Sensor Faults
    ("S-TSB20087-1", "TSB-20-087", "", 1, "Condition",
     "Heron and Osprey vehicles set intermittent codes C0035 or U0121, often with no fault found on retest."),
    ("S-TSB20087-2", "TSB-20-087", "", 2, "Repair Procedure",
     "Replace wheel speed sensor WSS-3300 and secure the revised harness clip. Do not replace the ABS module for these codes."),

    # TSB-23-052 - Battery Drain and Low System Voltage
    ("S-TSB23052-1", "TSB-23-052", "", 1, "Condition",
     "Falcon vehicles present with code P0562, dim lights at idle, or repeat flat batteries."),
    ("S-TSB23052-2", "TSB-23-052", "", 2, "Repair Procedure",
     "Test alternator ALT-8810 under load before fitting battery BAT-1200. Battery-only repairs do not correct the underlying low-output alternator."),

    # TSB-19-008 - Catalyst Efficiency Code After Software Update
    ("S-TSB19008-1", "TSB-19-008", "", 1, "Condition",
     "Falcon vehicles set code P0420 following an earlier engine calibration update, with no driveability complaint."),
    ("S-TSB19008-2", "TSB-19-008", "", 2, "Repair Procedure",
     "Apply the revised calibration. Replace catalytic converter CAT-5500 only if efficiency remains below threshold after the update."),

    # RC-2021-04 - Ignition Coil Connector Overheating
    ("S-RC202104-1", "RC-2021-04", "", 1, "Defect Description",
     "On certain 2019-2020 Falcon vehicles, the ignition coil IC-2042-A connector can overheat, increasing the risk of an engine compartment fire."),
    ("S-RC202104-2", "RC-2021-04", "", 2, "Remedy",
     "Dealers will replace the coils with revised ignition coil IC-2042-B and the associated connector free of charge."),

    # RC-2022-09 - Brake Hose Abrasion
    ("S-RC202209-1", "RC-2022-09", "", 1, "Defect Description",
     "On certain Heron vehicles, the front brake hose BH-7745 can contact the strut bracket, abrading the hose and risking brake fluid loss."),
    ("S-RC202209-2", "RC-2022-09", "", 2, "Remedy",
     "Dealers will inspect and replace brake hose BH-7745 with a revised routing clip free of charge."),
]

# section_id, ref_type, ref_value
section_refs = [
    ("S-FAL-1-1", "PART", "IC-2042-A"), ("S-FAL-1-1", "PART", "SP-1108"),
    ("S-FAL-1-2", "PART", "IC-2042-A"), ("S-FAL-1-2", "CODE", "P0301"), ("S-FAL-1-2", "CODE", "P0300"),
    ("S-FAL-1-3", "CODE", "P0300"), ("S-FAL-1-3", "CODE", "P0301"), ("S-FAL-1-3", "PART", "SP-1108"),
    ("S-FAL-1-4", "CODE", "P0420"), ("S-FAL-1-4", "PART", "CAT-5500"),
    ("S-FAL-2-1", "PART", "ALT-8810"), ("S-FAL-2-1", "PART", "BAT-1200"), ("S-FAL-2-1", "CODE", "P0562"),
    ("S-FAL-2-2", "PART", "ECM-9901"),
    ("S-FAL-3-1", "PART", "BP-7720"),
    ("S-HER-1-1", "PART", "BP-7720"), ("S-HER-1-1", "PART", "BR-7731"),
    ("S-HER-1-2", "PART", "BH-7745"),
    ("S-HER-1-3", "CODE", "C0035"), ("S-HER-1-3", "CODE", "U0121"), ("S-HER-1-3", "PART", "WSS-3300"),
    ("S-HER-2-1", "PART", "WSS-3300"), ("S-HER-2-1", "CODE", "C0035"),
    ("S-HER-2-2", "PART", "BAT-1200"), ("S-HER-2-2", "PART", "ALT-8810"),
    ("S-OSP-1-1", "PART", "WSS-3300"), ("S-OSP-1-1", "CODE", "C0035"),
    ("S-OSP-1-2", "PART", "ALT-8810"), ("S-OSP-1-2", "CODE", "P0562"),
    ("S-OSP-2-1", "CODE", "P0300"), ("S-OSP-2-1", "PART", "SP-1108"),
    ("S-TSB21114-1", "CODE", "P0301"), ("S-TSB21114-1", "CODE", "P0300"),
    ("S-TSB21114-2", "PART", "IC-2042-A"),
    ("S-TSB21114-3", "PART", "IC-2042-B"), ("S-TSB21114-3", "PART", "IC-2042-A"), ("S-TSB21114-3", "PART", "SP-1108"),
    ("S-TSB22031-1", "PART", "BP-7720"),
    ("S-TSB22031-2", "PART", "BR-7731"), ("S-TSB22031-2", "PART", "BP-7720"),
    ("S-TSB20087-1", "CODE", "C0035"), ("S-TSB20087-1", "CODE", "U0121"),
    ("S-TSB20087-2", "PART", "WSS-3300"),
    ("S-TSB23052-1", "CODE", "P0562"),
    ("S-TSB23052-2", "PART", "ALT-8810"), ("S-TSB23052-2", "PART", "BAT-1200"),
    ("S-TSB19008-1", "CODE", "P0420"),
    ("S-TSB19008-2", "PART", "CAT-5500"),
    ("S-RC202104-1", "PART", "IC-2042-A"),
    ("S-RC202104-2", "PART", "IC-2042-B"),
    ("S-RC202209-1", "PART", "BH-7745"),
    ("S-RC202209-2", "PART", "BH-7745"),
]

# ---------------------------------------------------------------------------
# Lakehouse side - exports of Delta tables under Unity Catalog
# (autofix.service.vehicle, work_order, work_order_part, part, procedure,
#  dtc_code)
# ---------------------------------------------------------------------------

parts = [
    # part_number, name, superseded_by
    ("IC-2042-A", "Ignition coil (original)", "IC-2042-B"),
    ("IC-2042-B", "Ignition coil (revised)", ""),
    ("SP-1108", "Spark plug set", ""),
    ("BP-7720", "Front brake pad kit", ""),
    ("BR-7731", "Front brake rotor pair", ""),
    ("BH-7745", "Front brake hose", ""),
    ("WSS-3300", "Wheel speed sensor", ""),
    ("BAT-1200", "AGM battery 70Ah", ""),
    ("ALT-8810", "Alternator 180A", ""),
    ("CAT-5500", "Catalytic converter", ""),
    ("ECM-9901", "Engine control module", ""),
]

dtc_codes = [
    ("P0300", "Random or multiple cylinder misfire detected"),
    ("P0301", "Cylinder 1 misfire detected"),
    ("P0420", "Catalyst system efficiency below threshold"),
    ("P0562", "System voltage low"),
    ("C0035", "Left front wheel speed sensor circuit"),
    ("U0121", "Lost communication with ABS control module"),
]

procedures = [
    ("PROC-IGN-COIL", "Ignition coil replacement", 1.2),
    ("PROC-MISFIRE-DIAG", "Misfire diagnosis", 0.8),
    ("PROC-BRAKE-FR", "Front brake pad and rotor service", 1.5),
    ("PROC-BRAKE-PAD", "Front brake pad replacement", 1.0),
    ("PROC-BRAKE-HOSE", "Brake hose replacement", 0.9),
    ("PROC-WSS", "Wheel speed sensor replacement", 0.7),
    ("PROC-ABS-DIAG", "ABS module diagnosis", 0.9),
    ("PROC-CHG-DIAG", "Charging system diagnosis", 0.6),
    ("PROC-BATT", "Battery replacement", 0.4),
    ("PROC-ALT", "Alternator replacement", 1.8),
    ("PROC-CAT", "Catalytic converter replacement", 2.4),
    ("PROC-ECM-FLASH", "ECM software update", 0.5),
    ("PROC-OIL", "Oil and filter service", 0.5),
]

vehicles = [
    # vin, make, model, year, engine
    ("CM-FAL-2019-0102", "Cascadia Motors", "Falcon", 2019, "2.0T"),
    ("CM-FAL-2019-0233", "Cascadia Motors", "Falcon", 2019, "2.0T"),
    ("CM-FAL-2019-0260", "Cascadia Motors", "Falcon", 2019, "1.6"),
    ("CM-FAL-2018-0031", "Cascadia Motors", "Falcon", 2018, "1.6"),
    ("CM-FAL-2018-0077", "Cascadia Motors", "Falcon", 2018, "1.6"),
    ("CM-FAL-2020-0317", "Cascadia Motors", "Falcon", 2020, "2.0T"),
    ("CM-FAL-2020-0451", "Cascadia Motors", "Falcon", 2020, "2.0T"),  # Dani's bay
    ("CM-FAL-2020-0468", "Cascadia Motors", "Falcon", 2020, "2.0T"),
    ("CM-FAL-2021-0529", "Cascadia Motors", "Falcon", 2021, "2.0T"),
    ("CM-FAL-2021-0583", "Cascadia Motors", "Falcon", 2021, "2.0T"),
    ("CM-FAL-2021-0610", "Cascadia Motors", "Falcon", 2021, "2.0T"),
    ("CM-FAL-2022-0712", "Cascadia Motors", "Falcon", 2022, "2.0T"),
    ("CM-FAL-2022-0745", "Cascadia Motors", "Falcon", 2022, "2.0T"),
    ("CM-FAL-2023-0801", "Cascadia Motors", "Falcon", 2023, "2.0T"),
    ("CM-HER-2019-1104", "Cascadia Motors", "Heron", 2019, "2.5"),
    ("CM-HER-2019-1121", "Cascadia Motors", "Heron", 2019, "2.5"),
    ("CM-HER-2020-1166", "Cascadia Motors", "Heron", 2020, "2.5"),
    ("CM-HER-2020-1203", "Cascadia Motors", "Heron", 2020, "2.5"),
    ("CM-HER-2021-1262", "Cascadia Motors", "Heron", 2021, "2.5"),
    ("CM-HER-2021-1290", "Cascadia Motors", "Heron", 2021, "2.5"),
    ("CM-HER-2022-1349", "Cascadia Motors", "Heron", 2022, "2.5"),
    ("CM-HER-2022-1372", "Cascadia Motors", "Heron", 2022, "2.5"),
    ("CM-HER-2023-1408", "Cascadia Motors", "Heron", 2023, "2.5"),
    ("CM-HER-2024-1450", "Cascadia Motors", "Heron", 2024, "2.5"),
    ("CM-OSP-2020-2055", "Cascadia Motors", "Osprey", 2020, "3.5 V6"),
    ("CM-OSP-2021-2101", "Cascadia Motors", "Osprey", 2021, "3.5 V6"),
    ("CM-OSP-2022-2149", "Cascadia Motors", "Osprey", 2022, "3.5 V6"),
    ("CM-OSP-2022-2160", "Cascadia Motors", "Osprey", 2022, "3.5 V6"),
    ("CM-OSP-2023-2204", "Cascadia Motors", "Osprey", 2023, "3.5 V6"),
    ("CM-OSP-2024-2251", "Cascadia Motors", "Osprey", 2024, "3.5 V6"),
]

work_orders = [
    # wo_id, vin, opened, odometer, complaint, dtc_code, procedure_id, comeback
    # --- Falcon 2.0T misfire arc (pre-bulletin repairs with IC-2042-A come back) ---
    ("WO-2020-0145", "CM-FAL-2019-0102", "2020-03-12", 18250, "Check engine light, rough idle at stops", "P0301", "PROC-IGN-COIL", True),
    ("WO-2020-0231", "CM-FAL-2019-0102", "2020-06-18", 21540, "Misfire returned after coil replacement", "P0301", "PROC-IGN-COIL", True),
    ("WO-2021-0512", "CM-FAL-2019-0102", "2021-10-05", 36120, "Third visit for misfire, customer frustrated", "P0301", "PROC-IGN-COIL", False),
    ("WO-2020-0289", "CM-FAL-2020-0317", "2020-08-03", 9870, "Intermittent stumble on acceleration", "P0300", "PROC-MISFIRE-DIAG", True),
    ("WO-2020-0334", "CM-FAL-2020-0317", "2020-09-21", 11930, "Stumble returned, now flashing CEL", "P0301", "PROC-IGN-COIL", True),
    ("WO-2021-0540", "CM-FAL-2020-0317", "2021-11-12", 25410, "Misfire again, requested different fix", "P0301", "PROC-IGN-COIL", False),
    ("WO-2021-0288", "CM-FAL-2021-0529", "2021-04-19", 6020, "Rough idle when cold", "P0301", "PROC-IGN-COIL", True),
    ("WO-2021-0533", "CM-FAL-2021-0529", "2021-10-28", 12480, "Misfire returned within six months", "P0301", "PROC-IGN-COIL", False),
    ("WO-2021-0455", "CM-FAL-2019-0233", "2021-08-02", 30100, "Hesitation and shaking at idle", "P0300", "PROC-IGN-COIL", True),
    ("WO-2021-0561", "CM-FAL-2019-0233", "2021-12-03", 33670, "Same hesitation as August visit", "P0300", "PROC-IGN-COIL", False),
    ("WO-2022-0094", "CM-FAL-2020-0468", "2022-02-14", 24890, "Check engine light, misfire counter on cyl 1", "P0301", "PROC-IGN-COIL", False),
    ("WO-2022-0203", "CM-FAL-2021-0583", "2022-05-09", 14230, "Rough running, applied TSB-21-114", "P0301", "PROC-IGN-COIL", False),
    ("WO-2023-0117", "CM-FAL-2021-0610", "2023-03-22", 28760, "Misfire under load, coils and plugs per bulletin", "P0300", "PROC-IGN-COIL", False),
    # --- Heron brake judder arc (pad-only repairs come back; pads+rotors do not) ---
    ("WO-2021-0310", "CM-HER-2019-1104", "2021-05-20", 35420, "Grinding from front brakes", "", "PROC-BRAKE-PAD", True),
    ("WO-2021-0398", "CM-HER-2019-1104", "2021-07-15", 38110, "Steering wheel shakes when braking", "", "PROC-BRAKE-FR", False),
    ("WO-2022-0150", "CM-HER-2020-1166", "2022-03-08", 30250, "Front brake pads worn at service", "", "PROC-BRAKE-PAD", True),
    ("WO-2022-0260", "CM-HER-2020-1166", "2022-06-02", 33480, "Vibration under braking since pad job", "", "PROC-BRAKE-FR", False),
    ("WO-2022-0312", "CM-HER-2020-1203", "2022-07-19", 41200, "Brake judder, repaired per TSB-22-031", "", "PROC-BRAKE-FR", False),
    ("WO-2023-0078", "CM-HER-2021-1262", "2023-02-10", 28940, "Brake vibration at highway speed", "", "PROC-BRAKE-FR", False),
    ("WO-2023-0301", "CM-FAL-2018-0031", "2023-08-15", 64100, "Front pads worn, no judder complaint", "", "PROC-BRAKE-PAD", False),
    # --- Heron brake hose recall remedies ---
    ("WO-2022-0410", "CM-HER-2021-1290", "2022-10-12", 24770, "Recall RC-2022-09 brake hose remedy", "", "PROC-BRAKE-HOSE", False),
    ("WO-2022-0431", "CM-HER-2022-1349", "2022-11-03", 9850, "Recall RC-2022-09 brake hose remedy", "", "PROC-BRAKE-HOSE", False),
    # --- Wheel speed sensor / ABS arc ---
    ("WO-2021-0102", "CM-HER-2019-1121", "2021-02-04", 28930, "ABS light intermittent", "C0035", "PROC-WSS", False),
    ("WO-2021-0177", "CM-OSP-2020-2055", "2021-03-19", 15670, "ABS and traction lights on", "C0035", "PROC-WSS", False),
    ("WO-2022-0058", "CM-HER-2022-1372", "2022-01-25", 4310, "ABS warning, no codes on retest", "U0121", "PROC-ABS-DIAG", False),
    ("WO-2023-0240", "CM-OSP-2021-2101", "2023-06-30", 31280, "ABS light after wheel bearing job", "C0035", "PROC-WSS", False),
    ("WO-2024-0033", "CM-OSP-2022-2149", "2024-01-22", 22140, "Traction control fault on rough roads", "C0035", "PROC-WSS", False),
    # --- Low voltage arc (battery-only repairs come back; alternator fixes it) ---
    ("WO-2022-0188", "CM-FAL-2018-0077", "2022-04-26", 58200, "Battery flat twice this month", "P0562", "PROC-BATT", True),
    ("WO-2022-0295", "CM-FAL-2018-0077", "2022-06-27", 60030, "New battery flat again, lights dim at idle", "P0562", "PROC-ALT", False),
    ("WO-2023-0155", "CM-FAL-2022-0712", "2023-04-14", 18840, "Low voltage warning, tested per TSB-23-052", "P0562", "PROC-ALT", False),
    ("WO-2023-0289", "CM-HER-2023-1408", "2023-08-08", 12060, "Slow cranking when cold", "", "PROC-BATT", False),
    # --- Catalyst arc ---
    ("WO-2019-0388", "CM-FAL-2019-0233", "2019-11-21", 8140, "CEL on, no driveability complaint", "P0420", "PROC-ECM-FLASH", False),
    ("WO-2020-0067", "CM-FAL-2019-0102", "2020-01-30", 16320, "CEL returned, catalyst efficiency low", "P0420", "PROC-CAT", False),
    ("WO-2021-0046", "CM-FAL-2019-0260", "2021-01-15", 25470, "CEL on after dealer software update", "P0420", "PROC-ECM-FLASH", False),
    # --- Routine service (noise) ---
    ("WO-2023-0010", "CM-FAL-2020-0451", "2023-01-09", 30120, "Scheduled oil service", "", "PROC-OIL", False),
    ("WO-2024-0021", "CM-FAL-2020-0451", "2024-01-18", 39880, "Scheduled oil service", "", "PROC-OIL", False),
    ("WO-2022-0005", "CM-OSP-2022-2160", "2022-01-06", 1490, "First service", "", "PROC-OIL", False),
    ("WO-2023-0350", "CM-OSP-2023-2204", "2023-10-02", 8770, "Scheduled oil service", "", "PROC-OIL", False),
    ("WO-2024-0102", "CM-FAL-2023-0801", "2024-04-11", 11930, "Scheduled oil service", "", "PROC-OIL", False),
]

work_order_parts = [
    # wo_id, part_number, qty
    ("WO-2020-0145", "IC-2042-A", 1), ("WO-2020-0145", "SP-1108", 1),
    ("WO-2020-0231", "IC-2042-A", 1),
    ("WO-2021-0512", "IC-2042-B", 4),
    ("WO-2020-0289", "SP-1108", 1),
    ("WO-2020-0334", "IC-2042-A", 1),
    ("WO-2021-0540", "IC-2042-B", 4),
    ("WO-2021-0288", "IC-2042-A", 1),
    ("WO-2021-0533", "IC-2042-B", 4),
    ("WO-2021-0455", "IC-2042-A", 2), ("WO-2021-0455", "SP-1108", 1),
    ("WO-2021-0561", "IC-2042-B", 4),
    ("WO-2022-0094", "IC-2042-B", 4),
    ("WO-2022-0203", "IC-2042-B", 4),
    ("WO-2023-0117", "IC-2042-B", 4), ("WO-2023-0117", "SP-1108", 1),
    ("WO-2021-0310", "BP-7720", 1),
    ("WO-2021-0398", "BP-7720", 1), ("WO-2021-0398", "BR-7731", 1),
    ("WO-2022-0150", "BP-7720", 1),
    ("WO-2022-0260", "BP-7720", 1), ("WO-2022-0260", "BR-7731", 1),
    ("WO-2022-0312", "BP-7720", 1), ("WO-2022-0312", "BR-7731", 1),
    ("WO-2023-0078", "BP-7720", 1), ("WO-2023-0078", "BR-7731", 1),
    ("WO-2023-0301", "BP-7720", 1),
    ("WO-2022-0410", "BH-7745", 2),
    ("WO-2022-0431", "BH-7745", 2),
    ("WO-2021-0102", "WSS-3300", 1),
    ("WO-2021-0177", "WSS-3300", 1),
    ("WO-2023-0240", "WSS-3300", 1),
    ("WO-2024-0033", "WSS-3300", 1),
    ("WO-2022-0188", "BAT-1200", 1),
    ("WO-2022-0295", "ALT-8810", 1),
    ("WO-2023-0155", "ALT-8810", 1), ("WO-2023-0155", "BAT-1200", 1),
    ("WO-2023-0289", "BAT-1200", 1),
    ("WO-2020-0067", "CAT-5500", 1),
]


write("documents.csv", ["doc_id", "doc_type", "title", "model", "published"], documents)
write("sections.csv", ["section_id", "doc_id", "parent_id", "seq", "title", "text"], sections)
write("section_refs.csv", ["section_id", "ref_type", "ref_value"], section_refs)
write("parts.csv", ["part_number", "name", "superseded_by"], parts)
write("dtc_codes.csv", ["code", "description"], dtc_codes)
write("procedures.csv", ["procedure_id", "name", "labor_hours"], procedures)
write("vehicles.csv", ["vin", "make", "model", "year", "engine"], vehicles)
write("work_orders.csv", ["wo_id", "vin", "opened", "odometer", "complaint", "dtc_code", "procedure_id", "comeback"],
      [(w, v, o, od, c, d, p, str(cb).lower()) for w, v, o, od, c, d, p, cb in work_orders])
write("work_order_parts.csv", ["wo_id", "part_number", "qty"], work_order_parts)
