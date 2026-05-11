from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_referee_created_at_stadium_created_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='Phase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('order', models.PositiveSmallIntegerField(default=1)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phases', to='api.tournament')),
            ],
            options={
                'ordering': ['tournament', 'order'],
                'unique_together': {('tournament', 'order')},
            },
        ),
        migrations.AddField(
            model_name='match',
            name='phase',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.phase'),
        ),
    ]
