package com.quickcart.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter(autoApply = true)
public class VectorConverter implements AttributeConverter<float[], Object> {

    @Override
    public Object convertToDatabaseColumn(float[] attribute) {
        if (attribute == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < attribute.length; i++) {
            sb.append(attribute[i]);
            if (i < attribute.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        try {
            PGobject pgobj = new PGobject();
            pgobj.setType("vector");
            pgobj.setValue(sb.toString());
            return pgobj;
        } catch (SQLException e) {
            throw new RuntimeException("Error converting float[] to PGobject vector", e);
        }
    }

    @Override
    public float[] convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }
        String valueStr;
        if (dbData instanceof PGobject) {
            valueStr = ((PGobject) dbData).getValue();
        } else {
            valueStr = dbData.toString();
        }
        if (valueStr == null || valueStr.isEmpty()) {
            return null;
        }
        String clean = valueStr.replace("[", "").replace("]", "").trim();
        if (clean.isEmpty()) {
            return new float[0];
        }
        String[] parts = clean.split(",");
        float[] result = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Float.parseFloat(parts[i].trim());
        }
        return result;
    }
}
