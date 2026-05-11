from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_teampreference'),
    ]

    operations = [
        migrations.CreateModel(
            name='RefereePreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.PositiveSmallIntegerField(default=0)),
                ('availability', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='referee_preferences', to='api.stadiumavailability')),
                ('referee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='preferences', to='api.referee')),
            ],
            options={
                'unique_together': {('referee', 'availability')},
            },
        ),
    ]
